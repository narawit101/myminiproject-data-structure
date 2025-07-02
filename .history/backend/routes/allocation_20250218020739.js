const express = require("express");
const pool = require("../db");
const router = express.Router();

// ✅ API เพิ่มการจัดสรรให้กลุ่มเป้าหมาย
router.post("/add", async (req, res) => {
    try {
        const { budget_id, target_group_id, percentage } = req.body;

        if (!budget_id || !target_group_id || percentage == null) {
            return res.status(400).json({ error: "กรุณาระบุ budget_id, target_group_id และ percentage" });
        }

        // ✅ ดึงข้อมูลกลุ่มเป้าหมายเดิมใน budget_id เดียวกัน
        const existingRecord = await pool.query(
            `SELECT allocation_percentage, allocated_amount FROM AllocationRatio 
             WHERE budget_id = $1 AND target_group_id = $2`,
            [budget_id, target_group_id]
        );

        let existingPercentage = 0;
        let existingAllocatedAmount = 0;

        if (existingRecord.rowCount > 0) {
            existingPercentage = existingRecord.rows[0].allocation_percentage;
            existingAllocatedAmount = existingRecord.rows[0].allocated_amount;
        }

        // ✅ ดึงผลรวมเปอร์เซ็นต์ทั้งหมดใน budget_id เดียวกัน
        const currentTotalResult = await pool.query(
            `SELECT SUM(allocation_percentage) AS total FROM AllocationRatio WHERE budget_id = $1`,
            [budget_id]
        );
        const currentTotal = currentTotalResult.rows[0].total || 0;

        // ✅ คำนวณผลรวมเปอร์เซ็นต์ใหม่
        const newTotal = (currentTotal - existingPercentage) + percentage;

        if (newTotal > 100) {
            return res.status(400).json({ error: `รวมเปอร์เซ็นต์ทั้งหมดเกิน 100% (${newTotal}%)` });
        }

        // ✅ ดึงข้อมูลงบประมาณ
        const budgetResult = await pool.query(
            "SELECT total_budget, remaining_budget FROM BudgetConfig WHERE id = $1",
            [budget_id]
        );
        if (budgetResult.rowCount === 0) {
            return res.status(404).json({ error: "ไม่พบบัญชีงบประมาณที่ระบุ" });
        }

        const { total_budget, remaining_budget } = budgetResult.rows[0];

        // ✅ คำนวณงบที่จัดสรรใหม่
        const allocated_amount = (percentage / 100) * total_budget;
        const new_remaining_budget = remaining_budget + existingAllocatedAmount - allocated_amount;

        // ✅ ถ้า target_group_id มีอยู่แล้ว อัปเดตแทนการเพิ่มใหม่
        if (existingRecord.rowCount > 0) {
            await pool.query(
                `UPDATE AllocationRatio 
                 SET allocation_percentage = $1, allocated_amount = $2 
                 WHERE budget_id = $3 AND target_group_id = $4`,
                [percentage, allocated_amount, budget_id, target_group_id]
            );
        } else {
            // ✅ เพิ่มข้อมูลลง AllocationRatio
            await pool.query(
                `INSERT INTO AllocationRatio (budget_id, target_group_id, allocation_percentage, allocated_amount)
                 VALUES ($1, $2, $3, $4)`,
                [budget_id, target_group_id, percentage, allocated_amount]
            );
        }

        // ✅ อัปเดตงบคงเหลือ
        await pool.query(
            `UPDATE BudgetConfig SET remaining_budget = $1 WHERE id = $2`,
            [new_remaining_budget, budget_id]
        );

        res.status(200).json({ message: "เพิ่ม/อัปเดตข้อมูลเรียบร้อย" });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
    }
});

// ✅ API ดูรายละเอียดการจัดสรรของแต่ละกลุ่ม
router.get("/get/:budget_id", async (req, res) => {
    try {
        const { budget_id } = req.params;

        const allocationResult = await pool.query(
            `SELECT bc.project_name,tg.name AS target_group, ar.allocation_percentage, ar.allocated_amount, 
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
// ✅ API อัปเดตเปอร์เซ็นต์การจัดสรรงบประมาณ
router.put("/update", async (req, res) => {
    try {
        // ✅ รับค่าจาก `req.body`
        const { budget_id, target_group_id, new_percentage } = req.body;

        // ✅ ตรวจสอบว่าข้อมูลครบถ้วน
        if (!budget_id || !target_group_id || new_percentage == null) {
            return res.status(400).json({ error: "กรุณาระบุ budget_id, target_group_id และ new_percentage" });
        }

        // ✅ ตรวจสอบว่า `budget_id` มีอยู่จริงหรือไม่
        const budgetResult = await pool.query(
            "SELECT total_budget, remaining_budget FROM BudgetConfig WHERE id = $1",
            [budget_id]
        );

        if (budgetResult.rowCount === 0) {
            return res.status(404).json({ error: "ไม่พบบัญชีงบประมาณที่ระบุ" });
        }

        const { total_budget, remaining_budget } = budgetResult.rows[0];

        // ✅ ตรวจสอบว่าสัดส่วนรวมกันต้องไม่เกิน 100%
        const currentTotalResult = await pool.query(
            `SELECT SUM(allocation_percentage) AS total FROM AllocationRatio 
             WHERE budget_id = $1 AND target_group_id <> $2`,
            [budget_id, target_group_id]
        );

        const currentTotal = currentTotalResult.rows[0].total || 0;
        const newTotal = currentTotal + new_percentage;

        if (newTotal > 100) {
            return res.status(400).json({ error: `รวมเปอร์เซ็นต์ทั้งหมดเกิน 100% (${newTotal}%)` });
        }

        // ✅ คำนวณจำนวนเงินที่ได้รับใหม่
        const new_allocated_amount = (new_percentage / 100) * total_budget;

        // ✅ ดึงค่าเดิมของ `allocated_amount`
        const oldAllocation = await pool.query(
            `SELECT allocated_amount FROM AllocationRatio 
             WHERE budget_id = $1 AND target_group_id = $2`,
            [budget_id, target_group_id]
        );

        if (oldAllocation.rowCount === 0) {
            return res.status(404).json({ error: "ไม่พบข้อมูลการจัดสรรสำหรับกลุ่มเป้าหมายนี้" });
        }

        const old_allocated_amount = oldAllocation.rows[0].allocated_amount;
        const difference = new_allocated_amount - old_allocated_amount;
        const new_remaining_budget = remaining_budget - difference;

        // ✅ ตรวจสอบว่าเงินคงเหลือพอหรือไม่
        if (new_remaining_budget < 0) {
            return res.status(400).json({ error: `เงินคงเหลือไม่พอ (${remaining_budget.toFixed(2)})` });
        }

        // ✅ อัปเดตเปอร์เซ็นต์ และจำนวนเงินที่ได้รับ
        await pool.query(
            `UPDATE AllocationRatio 
             SET allocation_percentage = $1, allocated_amount = $2 
             WHERE budget_id = $3 AND target_group_id = $4`,
            [new_percentage, new_allocated_amount, budget_id, target_group_id]
        );

        // ✅ อัปเดตเงินคงเหลือใน `BudgetConfig`
        await pool.query(
            `UPDATE BudgetConfig SET remaining_budget = $1 WHERE id = $2`,
            [new_remaining_budget, budget_id]
        );

        res.json({
            message: "อัปเดตการจัดสรรสำเร็จ",
            budget_id,
            target_group_id,
            updated_percentage: new_percentage,
            new_allocated_amount,
            remaining_budget: new_remaining_budget
        });

    } catch (err) {
        console.error("UPDATE AllocationRatio Error:", err.message);
        res.status(500).json({ error: "Server Error" });
    }
});


module.exports = router;