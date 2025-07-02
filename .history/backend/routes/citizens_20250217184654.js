const express = require("express");
const pool = require("../db"); // นำเข้า database connection
const router = express.Router();

// API ดึงข้อมูลประชาชนทั้งหมด
router.get("/get", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM citizens ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET Error:", err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/post", async (req, res) => {
  try {
    // รับค่าจาก `req.body`
    const {
      fname,
      lname,
      national_id,
      birth_date: birthDateString,
      income,
      occupation,
    } = req.body;

    // ตรวจสอบว่าข้อมูลครบถ้วน
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

    // ตรวจสอบและแปลง `birth_date`
    const birth_date = new Date(birthDateString);
    if (isNaN(birth_date.getTime())) {
      return res.status(400).json({ message: "รูปแบบวันเกิดไม่ถูกต้อง" });
    }

    // คำนวณอายุ
    const age = calculateAge(birth_date);

    // ตรวจสอบอายุให้อยู่ในช่วงที่กำหนด
    if (age < 18 || age > 99) {
      return res
        .status(400)
        .json({ message: "อายุจะต้องอยู่ในช่วง 18 - 99 ปี" });
    }

    // ตรวจสอบรายได้ต้องไม่ติดลบ
    if (income < 0) {
      return res
        .status(400)
        .json({ message: "รายได้ต้องเป็นจำนวนที่มากกว่าหรือเท่ากับ 0" });
    }

    let target_group_id = null;

    // ✅ 1️⃣ เช็ค age และ income ก่อน
    const groupQuery = await pool.query(
      `SELECT target_group_id FROM TargetGroup 
     WHERE age_min <= $1 AND age_max >= $1 
     AND income_range_min <= $2 AND income_range_max >= $2 
     LIMIT 1`,
      [age, income]
    );

    //  ถ้าพบกลุ่มที่ตรงกับ age และ income ให้ใช้เลย
    if (groupQuery.rowCount > 0) {
      target_group_id = groupQuery.rows[0].target_group_id;
    }

    //  ถ้า target_group_id ยังเป็น null และอาชีพเป็น "เกษตรกร"
    if (!target_group_id && occupation.includes("เกษตรกร")) {
      target_group_id = 3; // 🔥 กำหนด ID 3 สำหรับเกษตรกรโดยตรง
    }
    if (!target_group_id && !occupation.includes("เกษตรกร")) {
      target_group_id = 4; // 🔥 กำหนด ID 3 สำหรับเกษตรกรโดยตรง
    }

    // ตรวจสอบผลลัพธ์สุดท้าย
    // INSERT ข้อมูลลงฐานข้อมูล
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

    res.json({ message: "เพิ่มข้อมูลสำเร็จ", citizen: newCitizen.rows[0] });
  } catch (err) {
    console.error("INSERT Error:", err.message);
    res.status(500).send("Server Error");
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

router.get("/check-target/:national_id", async (req, res) => {
  const { national_id } = req.params;

  try {
      // ดึงข้อมูลของประชาชนจากเลขบัตร
      const citizenQuery = `
          SELECT c.fname, c.lname, c.birth_date, c.age, c.income, c.occupation, 
                 tg.name AS target_group, tg.age_min, tg.age_max, 
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

      res.json(rows[0]);
  } catch (error) {
      console.error("❌ Error checking target group:", error);
      res.status(500).json({ message: "เกิดข้อผิดพลาดในการตรวจสอบ" });
  }
});
module.exports = router;
