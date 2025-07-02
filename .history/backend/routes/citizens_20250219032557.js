const express = require("express");
const pool = require("../db"); // นำเข้า database connection
const router = express.Router();

// API ดึงข้อมูลประชาชนทั้งหมด
router.get("/check-target", async (req, res) => {
  try {
    const citizenQuery = `
      SELECT c.national_id,c.citizen_id, c.fname, c.lname, c.birth_date,   c.age, c.income, c.occupation,
             tg.name AS target_group, 
             fds.distribution_date
      FROM Citizens c
      LEFT JOIN TargetGroup tg ON c.target_group_id = tg.target_group_id
      LEFT JOIN FundDistributionSchedule fds ON tg.target_group_id = fds.target_group_id
      ORDER BY c.created_at DESC;
    `;

    const { rows } = await pool.query(citizenQuery);

    if (rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบข้อมูลประชาชน" });
    }

    res.json(rows);
  } catch (error) {
    console.error("❌ Error checking target group:", error.message); // เพิ่มการแสดงข้อความผิดพลาดที่ละเอียดขึ้น
    res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการตรวจสอบ", error: error.message }); // ส่งข้อความผิดพลาดกลับ
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
    const citizenQuery = `
          SELECT c.fname, c.lname, c.birth_date, c.age, c.income, c.occupation, 
                 tg.name AS target_group,
                 fds.distribution_date 
          FROM Citizens c
          LEFT JOIN TargetGroup tg ON c.target_group_id = tg.target_group_id
          LEFT JOIN FundDistributionSchedule fds ON tg.target_group_id = fds.target_group_id
          WHERE c.national_id = $1;
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
