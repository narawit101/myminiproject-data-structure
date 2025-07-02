const express = require('express');
const pool = require('../db');
const authenticate = require('../middleware/authMiddleware');
require('dotenv').config();

const router = express.Router();

// ✅ ดึงข้อมูลงบประมาณทั้งหมด
router.get('/get', authenticate, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM BudgetConfig ORDER BY year DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
        
    }
});

// ✅ เพิ่มงบประมาณใหม่
router.post('/add', authenticate, async (req, res) => {
    try {
        const { year, project_name, total_budget } = req.body;

        if (!year || !project_name || !total_budget) {
            return res.status(400).json({ message: "ข้อมูลไม่ครบถ้วน!" });
        }

        const newBudget = await pool.query(
            `INSERT INTO BudgetConfig (year, project_name, total_budget) 
             VALUES ($1, $2, $3) RETURNING *`,
            [year, project_name, total_budget]
        );

        res.json({ message: "เพิ่มงบประมาณสำเร็จ", budget: newBudget.rows[0] });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// ✅ แก้ไขงบประมาณ
router.put('/update/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { year, project_name, total_budget } = req.body;

        const updatedBudget = await pool.query(
            `UPDATE BudgetConfig 
             SET year = $1, project_name = $2, total_budget = $3, updated_at = NOW() 
             WHERE id = $4 RETURNING *`,
            [year, project_name, total_budget, id]
        );

        if (updatedBudget.rowCount === 0) {
            return res.status(404).json({ message: "ไม่พบข้อมูลที่ต้องการแก้ไข!" });
        }

        res.json({ message: "แก้ไขงบประมาณสำเร็จ", budget: updatedBudget.rows[0] });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// ✅ ลบงบประมาณ
router.delete('/delete/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        const deletedBudget = await pool.query(
            `DELETE FROM BudgetConfig WHERE id = $1 RETURNING *`,
            [id]
        );

        if (deletedBudget.rowCount === 0) {
            return res.status(404).json({ message: "ไม่พบข้อมูลที่ต้องการลบ!" });
        }

        res.json({ message: "ลบงบประมาณสำเร็จ" });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
