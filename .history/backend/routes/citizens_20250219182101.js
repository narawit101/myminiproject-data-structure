const express = require("express");
const pool = require("../db"); // นำเข้า database connection
const router = express.Router();

router.post("/post", async (req, res) => {
  try {
    const {
      fname,
      lname,
      national_id,
      birth_date: birthDateString,
      income,
      occupation,
    } = req.body;

    if (
      !fname ||
      !lname ||
      !national_id ||
      !birthDateString ||
      !income ||
      !occupation
    ) {
      return res.status(400).json({ message: "ข้อมูลไม่ครบถ้วน" });
    }

    const birth_date = new Date(birthDateString);
    if (isNaN(birth_date.getTime())) {
      return res.status(400).json({ message: "รูปแบบวันเกิดไม่ถูกต้อง" });
    }

    const age = calculateAge(birth_date);
    if (age < 18 || age > 99) {
      return res
        .status(400)
        .json({ message: "อายุจะต้องอยู่ในช่วง 18 - 99 ปี" });
    }

    if (income < 0) {
      return res
        .status(400)
        .json({ message: "รายได้ต้องเป็นจำนวนที่มากกว่าหรือเท่ากับ 0" });
    }

    // ✅ ตรวจสอบว่ามี `national_id` ซ้ำหรือไม่
    const existingCitizen = await pool.query(
      `SELECT * FROM citizens WHERE national_id = $1`,
      [national_id]
    );

    if (existingCitizen.rowCount > 0) {
      return res
        .status(400)
        .json({ message: "เลขบัตรประชาชนนี้ถูกใช้งานแล้ว" });
    }

    // ✅ ตรวจสอบว่าเป็นกลุ่มเป้าหมายที่มีสิทธิ์รับเงินหรือไม่
    const groupQuery = await pool.query(
      `SELECT target_group_id FROM TargetGroup 
           WHERE age_min <= $1 AND age_max >= $1 
           AND income_range_min <= $2 AND income_range_max >= $2 
           LIMIT 1`,
      [age, income]
    );

    let target_group_id =
    if (groupQuery.rowCount > 0) {
      const { target_group_id: groupId, income_range_max } = groupQuery.rows[0];
  
      // ✅ ตรวจสอบว่า รายได้เกิน income_range_max หรือไม่
      if (income > income_range_max) {
        target_group_id = null; // ❌ ตัดสิทธิ์ ถ้ารายได้เกินเกณฑ์
      } else {
        target_group_id = groupId;
      }
    }
  }

    // ✅ เพิ่มข้อมูลประชาชน
    const newCitizen = await pool.query(
      `INSERT INTO citizens (fname, lname, national_id, birth_date, age, income, occupation, target_group_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        fname,
        lname,
        national_id,
        birth_date,
        age,
        income,
        occupation,
        target_group_id,
      ]
    );

    const citizen = newCitizen.rows[0];

    let transaction = null;
    if (target_group_id) {
      // ✅ ตรวจสอบ budget_id ที่มีงบเหลือ
      const budgetResult = await pool.query(
        `SELECT id FROM BudgetConfig WHERE remaining_budget > 0 ORDER BY year DESC LIMIT 1`
      );

      if (budgetResult.rowCount > 0) {
        const budget_id = budgetResult.rows[0].id;

        // ✅ ดึง allocation_percentage และ max_recipients
        const allocationResult = await pool.query(
          `SELECT allocation_percentage, max_recipients FROM AllocationRatio 
                   WHERE budget_id = $1 AND target_group_id = $2`,
          [budget_id, target_group_id]
        );

        if (allocationResult.rowCount > 0) {
          const { allocation_percentage, max_recipients } =
            allocationResult.rows[0];

          // ✅ ตรวจสอบจำนวนผู้ที่ได้รับเงินแล้ว
          const recipientCountResult = await pool.query(
            `SELECT COUNT(*) AS count FROM Transaction 
                       WHERE citizen_id IN (SELECT citizen_id FROM citizens WHERE target_group_id = $1) 
                       AND status = 'completed'`,
            [target_group_id]
          );
          // ✅ ตรวจสอบว่าเป็น "เกษตรกร" หรือไม่
          if (occupation === "เกษตรกร") {
            target_group_id = 3;
          } else {
            // ✅ ตรวจสอบว่าอยู่ในกลุ่มเป้าหมายที่มีสิทธิ์รับเงินหรือไม่ (ถ้าไม่ใช่เกษตรกร)
            const groupQuery = await pool.query(
              `SELECT target_group_id FROM TargetGroup 
     WHERE age_min <= $1 AND age_max >= $1 
     AND income_range_min <= $2 AND income_range_max >= $2 
     LIMIT 1`,
              [age, income]
            );

            target_group_id =
              groupQuery.rowCount > 0
                ? groupQuery.rows[0].target_group_id
                : null;
          }
          const current_recipients = parseInt(
            recipientCountResult.rows[0].count,
            10
          );
          if (current_recipients < max_recipients) {
            // ✅ คำนวณเงินที่แต่ละคนจะได้รับ
            const totalBudgetResult = await pool.query(
              `SELECT total_budget FROM BudgetConfig WHERE id = $1`,
              [budget_id]
            );
            const total_budget = totalBudgetResult.rows[0].total_budget;

            const allocated_amount =
              (allocation_percentage / 100) * total_budget;
            const amount_per_person = allocated_amount / max_recipients;

            // ✅ เพิ่มข้อมูลลง Transaction อัตโนมัติ
            const transactionResult = await pool.query(
              `INSERT INTO Transaction (citizen_id, amount, transaction_date, status, queue_order)
                           VALUES ($1, $2, NOW(), 'pending', 
                                   (SELECT COALESCE(MAX(queue_order), 0) + 1 FROM Transaction))
                           RETURNING *`,
              [citizen.citizen_id, amount_per_person]
            );

            transaction = transactionResult.rows[0];
          }
        }
      }
    }

    res.json({
      message: "เพิ่มข้อมูลสำเร็จ",
      citizen,
      transaction: transaction || "ไม่มีการแจกเงินให้กลุ่มนี้",
    });
  } catch (err) {
    console.error("INSERT Error:", err.message);
    res.status(500).json({ error: "Server Error", details: err.message });
  }
});

// ✅ ฟังก์ชันคำนวณอายุ
function calculateAge(birth_date) {
  const birthDate = new Date(birth_date);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}
router.get("/check-target", async (req, res) => {
  try {
    const citizenQuery = `
      SELECT c.national_id, c.citizen_id, c.fname, c.lname, c.birth_date, 
             c.age, c.income, c.occupation, tg.name AS target_group, 
             fds.distribution_date
      FROM Citizens c
      LEFT JOIN TargetGroup tg ON c.target_group_id = tg.target_group_id
      LEFT JOIN FundDistributionSchedule fds ON tg.target_group_id = fds.target_group_id
      ORDER BY c.created_at DESC;
    `;

    const { rows } = await pool.query(citizenQuery);

    // ✅ ถ้าไม่มีข้อมูล ให้ส่งอาร์เรย์ว่างกลับแทน
    res.status(200).json(rows);
  } catch (error) {
    console.error("❌ Error checking target group:", error.message);
    res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการตรวจสอบ", error: error.message });
  }
});

// ✅ อัปเดตข้อมูลประชาชน + คำนวณกลุ่มเป้าหมายอัตโนมัติ
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let { fname, lname, birth_date, income, occupation } = req.body;

    // ตรวจสอบว่ามี citizen_id นี้หรือไม่
    const checkCitizen = await pool.query(
      `SELECT * FROM citizens WHERE citizen_id = $1`,
      [id]
    );

    if (checkCitizen.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "ไม่พบข้อมูลประชาชนที่ต้องการแก้ไข" });
    }

    // ✅ คำนวณอายุใหม่จาก birth_date
    birth_date = new Date(birth_date);
    if (isNaN(birth_date.getTime())) {
      return res.status(400).json({ message: "รูปแบบวันเกิดไม่ถูกต้อง" });
    }
    const age = calculateAge(birth_date);

    // ✅ คำนวณกลุ่มเป้าหมายใหม่
    let target_group_id = null;

    // 🔹 1️⃣ คำนวณกลุ่มเป้าหมายจากอายุและรายได้
    const groupQuery = await pool.query(
      `SELECT target_group_id FROM TargetGroup 
      WHERE age_min <= $1 AND age_max >= $1 
      AND income_range_min <= $2 AND income_range_max >= $2 
      LIMIT 1`,
      [age, income]
    );

    if (groupQuery.rowCount > 0) {
      target_group_id = groupQuery.rows[0].target_group_id;
    }

    // 🔹 2️⃣ ถ้า occupation เป็น "เกษตรกร" แต่ไม่มี target group ให้กำหนด target_group_id = 3
    if (!target_group_id && occupation.includes("เกษตรกร")) {
      target_group_id = 3;
    }
    if (!target_group_id && !occupation.includes("เกษตรกร")) {
      target_group_id = 4;
    }

    // ✅ อัปเดตข้อมูลในฐานข้อมูล
    const result = await pool.query(
      `UPDATE citizens 
      SET fname = $1, lname = $2, birth_date = $3, age = $4, income = $5, occupation = $6, target_group_id = $7
      WHERE citizen_id = $8 RETURNING *`,
      [fname, lname, birth_date, age, income, occupation, target_group_id, id]
    );

    res.json({ message: "อัปเดตข้อมูลสำเร็จ", updatedCitizen: result.rows[0] });
  } catch (err) {
    console.error("UPDATE Error:", err.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" });
  }
});

// ฟังก์ชันคำนวณอายุ
function calculateAge(birth_date) {
  const birthDate = new Date(birth_date);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

router.get("/check-target/:national_id", async (req, res) => {
  const { national_id } = req.params;

  try {
    // ดึงข้อมูลของประชาชนจากเลขบัตร
    // ✅ ดึงข้อมูลประชาชน + กลุ่มเป้าหมาย + การทำธุรกรรม
    const citizenQuery = `
SELECT c.fname, c.lname, c.birth_date, c.age, c.income, c.occupation, 
       tg.name AS target_group, fds.distribution_date,
       t.amount, t.transaction_date, t.status 
FROM Citizens c
LEFT JOIN TargetGroup tg ON c.target_group_id = tg.target_group_id
LEFT JOIN FundDistributionSchedule fds ON tg.target_group_id = fds.target_group_id
LEFT JOIN Transaction t ON c.citizen_id = t.citizen_id  -- ✅ JOIN Transaction
WHERE c.national_id = $1
ORDER BY t.transaction_date DESC LIMIT 1; -- ✅ ดึงธุรกรรมล่าสุด
`;

    const { rows } = await pool.query(citizenQuery, [national_id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบข้อมูลประชาชน" });
    }

    let citizenData = rows[0];

    // ✅ แปลงวันที่เกิด และวันที่แจกเงินเป็นรูปแบบที่อ่านง่าย
    if (citizenData.birth_date) {
      citizenData.birth_date = new Date(citizenData.birth_date)
        .toISOString()
        .split("T")[0]; // YYYY-MM-DD
    }

    if (citizenData.distribution_date) {
      citizenData.distribution_date = new Date(
        citizenData.distribution_date
      ).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }); // แสดงเป็น "1 มกราคม 2024"
    }

    res.json(citizenData);
  } catch (error) {
    console.error("❌ Error checking target group:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการตรวจสอบ" });
  }
});

// API ลบข้อมูลประชาชน
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM citizens WHERE citizen_id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "ไม่พบข้อมูลที่ต้องการลบ" });
    }

    res.json({ message: "ลบข้อมูลสำเร็จ", deletedCitizen: result.rows[0] });
  } catch (err) {
    console.error("DELETE Error:", err.message);
    res.status(500).send("Server Error");
  }
});
// ✅ อัปเดตข้อมูลประชาชน
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { fname, lname, birth_date, income, occupation } = req.body;

    // ตรวจสอบว่ามี citizen_id นี้หรือไม่
    const checkCitizen = await pool.query(
      `SELECT * FROM citizens WHERE citizen_id = $1`,
      [id]
    );

    if (checkCitizen.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "ไม่พบข้อมูลประชาชนที่ต้องการแก้ไข" });
    }

    // อัปเดตข้อมูล
    const result = await pool.query(
      `UPDATE citizens 
      SET fname = $1, lname = $2, birth_date = $3, income = $4, occupation = $5
      WHERE citizen_id = $6 RETURNING *`,
      [fname, lname, birth_date, income, occupation, id]
    );

    res.json({ message: "อัปเดตข้อมูลสำเร็จ", updatedCitizen: result.rows[0] });
  } catch (err) {
    console.error("UPDATE Error:", err.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" });
  }
});

module.exports = router;
