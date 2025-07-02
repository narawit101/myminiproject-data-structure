const express = require("express");
const pool = require("../db"); // เชื่อมต่อฐานข้อมูล
const router = express.Router();

// ✅ API อัปเดตสถานะธุรกรรม
router.put("/update", async (req, res) => {
    try {
        const { transaction_id, citizen_id, status, target_group_id } = req.body;

        if (!transaction_id || !citizen_id || !status || !target_group_id) {
            return res.status(400).json({ error: "กรุณาระบุ transaction_id, citizen_id, status และ target_group_id" });
        }

        // ✅ ตรวจสอบว่าธุรกรรมมีอยู่จริง
        const checkTransaction = await pool.query(
            `SELECT * FROM transaction WHERE transaction_id = $1 AND citizen_id = $2`,
            [transaction_id, citizen_id]
        );

        if (checkTransaction.rowCount === 0) {
            return res.status(404).json({ error: "ไม่พบธุรกรรมที่ต้องการอัปเดต" });
        }

        // ✅ อัปเดตสถานะธุรกรรม
        const updateTransaction = await pool.query(
            `UPDATE transaction 
             SET status = $1 
             WHERE transaction_id = $2 AND citizen_id = $3 RETURNING *`,
            [status, transaction_id, citizen_id]
        );

        if (updateTransaction.rowCount === 0) {
            return res.status(500).json({ error: "เกิดข้อผิดพลาดในการอัปเดตธุรกรรม" });
        }

        // ✅ บันทึกวันที่แจกเงินใน `funddistributionschedule` ถ้าสถานะเป็น completed
        if (status === "completed") {
            await pool.query(
                `INSERT INTO funddistributionschedule (target_group_id, distribution_date)
                 VALUES ($1, NOW())`,
                [target_group_id]
            );
        }

        res.json({
            message: "อัปเดตสถานะธุรกรรมสำเร็จ",
            transaction: updateTransaction.rows[0],
            distribution_recorded: status === "completed" ? true : false
        });

    } catch (err) {
        console.error("UPDATE Transaction Error:", err.message);
        res.status(500).json({ error: "Server Error", details: err.message });
    }
});

module.exports = router;