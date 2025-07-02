const express = require('express');
const pool = require('../db');
const authenticate = require('../middleware/authMiddleware');

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

// อัปเดตงบประมาณ (เฉพาะฟิลด์ที่ส่งมา)
router.put("/update/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // ตรวจสอบว่ามีข้อมูลที่ต้องอัปเดตหรือไม่
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "ไม่มีข้อมูลที่ต้องการอัปเดต" });
        }

        // สร้าง SQL UPDATE แบบไดนามิก
        const fields = [];
        const values = [];
        let index = 1;

        for (const key in updates) {
            fields.push(`${key} = $${index}`);
            values.push(updates[key]);
            index++;
        }

        values.push(id); // ใส่ค่า id เป็นค่าตัวสุดท้าย

        const query = `
            UPDATE budgets
            SET ${fields.join(", ")}, updated_at = NOW()
            WHERE id = $${index}
            RETURNING *;
        `;

        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "ไม่พบโครงการที่ต้องการอัปเดต" });
        }

        res.json({ message: "อัปเดตสำเร็จ", data: result.rows[0] });

    } catch (error) {
        console.error("Error updating budget:", error);
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
