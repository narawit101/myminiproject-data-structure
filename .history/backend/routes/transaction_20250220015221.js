const express = require("express");
const pool = require("../db"); // เชื่อมต่อฐานข้อมูล
const router = express.Router();

// ✅ API อัปเดตสถานะธุรกรรม
router.put("/update", async (req, res) => {
    console.log("📥 รับข้อมูล:", req.body);
  
    const { transaction_id, citizen_id, status, target_group_id } = req.body;
  
    if (!transaction_id || !citizen_id || !status || !target_group_id) {
      return res.status(400).json({ message: "ข้อมูลไม่ครบถ้วน" });
    }
  
    try {
      const result = await pool.query(
        `UPDATE Transaction SET status = $1 WHERE transaction_id = $2 AND citizen_id = $3 RETURNING *`,
        [status, transaction_id, citizen_id]
      );
  
      if (result.rowCount > 0) {
        res.json({ message: "✅ อัปเดตสำเร็จ", data: result.rows[0] });
      } else {
        res.status(404).json({ message: "❌ ไม่พบข้อมูลที่ต้องการอัปเดต" });
      }
    } catch (error) {
      console.error("❌ Database Error:", error);
      res.status(500).json({ message: "❌ Server Error" });
    }
  });
  

router.get("/get", async (req, res) => {
  try {
    const result = pool.query(
      ` SELECT 
       ci.citizen_id,
       ci.fname,
       ci.lname,
       ci.national_id,
       ci.birth_date,
       ci.age,
       ci.income,
       ci.occupation,
       tg.target_group_id,
       tg.name AS group_name,
       ta.status,
       ci.created_at
   FROM Citizens ci
   JOIN TargetGroup tg ON ci.target_group_id = tg.target_group_id
   JOIN Transaction ta ON ci.citizen_id = ta.citizen_id
   ORDER BY ci.target_group_id ASC, ci.created_at ASC; `
    );
    res.json((await result).rows);
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
});
module.exports = router;
