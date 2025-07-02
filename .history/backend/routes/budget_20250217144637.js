const express = require('express');
const pool = require('../db');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');


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

// แก้ไขงบประมาณ (UPDATE)
router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { year, project_name, total_budget } = req.body;

        if (!year || !project_name || total_budget <= 0) {
            return res.status(400).json({ message: "ข้อมูลไม่ถูกต้อง" });
        }

        const result = await pool.query(
            `UPDATE BudgetConfig 
             SET year = $1, project_name = $2, total_budget = $3, updated_at = CURRENT_TIMESTAMP
             WHERE id = $4 RETURNING *`,
            [year, project_name, total_budget, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "ไม่พบนงบประมาณที่ต้องการแก้ไข" });
        }

        res.json({ message: "อัปเดตงบประมาณสำเร็จ", budget: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// ลบงบประมาณ
router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query('DELETE FROM BudgetConfig WHERE id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "ไม่พบนงบประมาณที่ต้องการลบ" });
        }

        res.json({ message: "ลบงบประมาณสำเร็จ", deletedBudget: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
