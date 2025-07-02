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
router.put("/update/:id", async (req, res) => {
    const { id } = req.params;
    const { project_name, total_budget } = req.body; // ✅ เพิ่ม total_budget

    try {
        console.log("Update Request:", { id, project_name, total_budget });

        if (!id || !project_name || !total_budget) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // ✅ อัปเดตชื่อโครงการและงบประมาณ
        const result = await pool.query(
            "UPDATE budgetconfig SET project_name = $1, total_budget = $2 WHERE id = $3 RETURNING *",
            [project_name, total_budget, id]
        );

        console.log("SQL Result:", result.rows);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Project not found" });
        }

        res.json({ message: "Project updated successfully", data: result.rows[0] });
    } catch (error) {
        console.error("Error updating project:", error);
        res.status(500).json({ message: "Server error" });
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
