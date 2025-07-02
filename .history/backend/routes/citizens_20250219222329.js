const express = require("express");
const pool = require("../db"); // นำเข้า database connection
const router = express.Router();

calculateAge

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
