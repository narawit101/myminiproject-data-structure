const express = require('express');
const pool = require('../db');
const router = express.Router();

// ดึงข้อมูลงบประมาณ
router.get('/get', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM BudgetConfig ORDER BY year DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// เพิ่มข้อมูลงบประมาณ
router.post('/add', async (req, res) => {
    try {
        const { year, project_name, total_budget } = req.body;

        if (!year || !project_name || total_budget <= 0) {
            return res.status(400).json({ message: "ข้อมูลไม่ถูกต้อง" });
        }

        const result = await pool.query(
            `INSERT INTO BudgetConfig (year, project_name, total_budget) 
             VALUES ($1, $2, $3) RETURNING *`,
            [year, project_name, total_budget]
        );

        res.json({ message: "เพิ่มงบประมาณสำเร็จ", budget: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
