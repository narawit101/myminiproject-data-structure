const express = require("express");
const pool = require("../db"); // เชื่อมต่อฐานข้อมูล
const router = express.Router();

// ✅ API อัปเดตสถานะธุรกรรม
router.put("/update", async (req, res) => {
    try {
      const { transaction_ids, status, target_group_id } = req.body; // transaction_ids เป็น array
  
      if (!transaction_ids || !status || !target_group_id) {
        return res.status(400).json({
          error: "กรุณาระบุ transaction_ids, status และ target_group_id",
        });
      }
  
      if (!Array.isArray(transaction_ids) || transaction_ids.length === 0) {
        return res.status(400).json({ error: "transaction_ids ต้องเป็น array" });
      }
  
      // ✅ ตรวจสอบว่าทุก transaction มีอยู่จริง
      const checkTransactions = await pool.query(
        `SELECT transaction_id FROM transaction WHERE transaction_id = ANY($1)`,
        [transaction_ids]
      );
  
      if (checkTransactions.rowCount !== transaction_ids.length) {
        return res.status(404).json({ error: "มีธุรกรรมที่ไม่พบในระบบ" });
      }
  
      // ✅ อัปเดตสถานะธุรกรรมทั้งหมด
      const updateTransactions = await pool.query(
        `UPDATE transaction 
         SET status = $1 
         WHERE transaction_id = ANY($2) 
         RETURNING *`,
        [status, transaction_ids]
      );
  
      if (updateTransactions.rowCount === 0) {
        return res
          .status(500)
          .json({ error: "เกิดข้อผิดพลาดในการอัปเดตธุรกรรม" });
      }
  
      // ✅ ถ้าสถานะเป็น "completed" ให้บันทึก `funddistributionschedule`
      if (status === "completed") {
        await pool.query(
          `INSERT INTO funddistributionschedule (target_group_id, distribution_date)
           VALUES ($1, NOW())`,
          [target_group_id]
        );
      }
  
      res.json({
        message: "อัปเดตสถานะธุรกรรมสำเร็จ",
        transactions: updateTransactions.rows,
        distribution_recorded: status === "completed",
      });
    } catch (err) {
      console.error("UPDATE Transaction Error:", err.message);
      res.status(500).json({ error: "Server Error", details: err.message });
    }
  });
  

router.get("/get", async (req, res) => {
  try {
    const result = pool.query(
      ` SELECT 
      ta.transaction_id, -- ✅ เพิ่ม transaction_id
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
