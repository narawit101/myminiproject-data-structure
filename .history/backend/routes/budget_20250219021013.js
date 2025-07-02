const express = require('express');
const pool = require('../db');
const authenticate = require('../middleware/authMiddleware');
require('dotenv').config();

const router = express.Router();

router.get('/get', authenticate, async (req, res) => {
    try {
      // Query งบประมาณทั้งหมดจากฐานข้อมูล
      const result = await pool.query(`
        SELECT b.*, COALESCE(SUM(spent_amount), 0) AS total_spent
        FROM BudgetConfig b
        LEFT JOIN expenditures e ON b.id = e.budget_id
        GROUP BY b.id
        ORDER BY b.year DESC
      `);
  
      // คำนวณ remaining_budget
      const budgets = result.rows.map(budget => {
        // คำนวณ remaining_budget
        const remainingBudget = budget.total_budget - budget.total_spent;
        return {
          ...budget,
          remaining_budget: remainingBudget, // เพิ่ม remaining_budget ที่คำนวณแล้ว
        };
      });
  
      res.json(budgets); // ส่งข้อมูลที่คำนวณเสร็จแล้วไปยัง frontend
    } catch (err) {
      console.error("Error fetching budget data:", err);
      res.status(500).json({ message: "Server Error" });
    }
  });
  
router.get("/get/:budget_id",authenticate, async (req, res) => {
    try {
        const { budget_id } = req.params;

        const allocationResult = await pool.query(
            `SELECT tg.name AS target_group, ar.allocation_percentage, ar.allocated_amount, 
                    bc.remaining_budget 
             FROM AllocationRatio ar
             JOIN TargetGroup tg ON ar.target_group_id = tg.target_group_id
             JOIN BudgetConfig bc ON ar.budget_id = bc.id
             WHERE ar.budget_id = $1`,
            [budget_id]
        );

        res.json({ budget_id, allocations: allocationResult.rows });
    } catch (err) {
        console.error("GET Allocation Details Error:", err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// ✅ เพิ่มงบประมาณใหม่
router.post('/add', authenticate, async (req, res) => {
    try {
        const { year, project_name, total_budget } = req.body;

        if (!year || !project_name || !total_budget) {
            return res.status(400).json({ error: "กรุณาระบุปี, ชื่อโครงการ และงบประมาณ" });
        }

        const result = await pool.query(
            `INSERT INTO BudgetConfig (year, project_name, total_budget, remaining_budget) 
             VALUES ($1, $2, $3, $3) RETURNING *`,
            [year, project_name, total_budget]
        );

        res.json({ message: "เพิ่มงบประมาณสำเร็จ", budget: result.rows[0] });
    } catch (err) {
        console.error("INSERT BudgetConfig Error:", err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

router.put("/update/:budget_id", async (req, res) => {
    try {
        const { budget_id } = req.params; // Get budget_id from the URL
        const { project_name, total_budget } = req.body; // Get project_name and total_budget from the body

        // ✅ ตรวจสอบว่ามีข้อมูลครบหรือไม่
        if (!budget_id || !project_name || !total_budget) {
            return res.status(400).json({ error: "กรุณาระบุ budget_id, project_name และ total_budget" });
        }

        // ✅ อัปเดตงบประมาณและชื่อโปรเจกต์
        const result = await pool.query(
            `UPDATE BudgetConfig SET project_name = $1, total_budget = $2, remaining_budget = $2, updated_at = NOW() 
             WHERE id = $3 RETURNING *`,
            [project_name, total_budget, budget_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "ไม่พบบัญชีงบประมาณที่ระบุ" });
        }

        res.json({ message: "อัปเดตงบประมาณสำเร็จ", budget: result.rows[0] });
    } catch (err) {
        console.error("UPDATE BudgetConfig Error:", err.message);
        res.status(500).json({ error: "Server Error" });
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
