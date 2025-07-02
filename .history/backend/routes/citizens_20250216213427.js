const express = require('express');
const pool = require('../db'); // นำเข้า database connection
const router = express.Router();

// API ดึงข้อมูลประชาชนทั้งหมด
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM citizens ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// API เพิ่มข้อมูลประชาชนใหม่
router.post('/', async (req, res) => {
    try {
        const { fname, lname, national_id, birth_date, age, income, occupation, target_group_id } = req.body;
        const newCitizen = await pool.query(
            `INSERT INTO citizens (fname, lname, national_id, birth_date, age, income, occupation, target_group_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [fname, lname, national_id, birth_date, age, income, occupation, target_group_id]
        );
        res.json(newCitizen.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// API แก้ไขข้อมูลประชาชน
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { fname, lname, income, occupation, target_group_id, bank_account } = req.body;
        
        const result = await pool.query(
            `UPDATE citizens 
             SET fname = $1, lname = $2, income = $3, occupation = $4, target_group_id = $5, bank_account = $6 
             WHERE citizen_id = $7 RETURNING *`,
            [fname, lname, income, occupation, target_group_id, bank_account, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "ไม่พบข้อมูลที่ต้องการอัปเดต" });
        }

        res.json({ message: 'อัปเดตข้อมูลสำเร็จ', citizen: result.rows[0] });
    } catch (err) {
        console.error("UPDATE Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// API ลบข้อมูลประชาชน
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query('DELETE FROM citizens WHERE citizen_id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "ไม่พบข้อมูลที่ต้องการลบ" });
        }

        res.json({ message: 'ลบข้อมูลสำเร็จ', deletedCitizen: result.rows[0] });
    } catch (err) {
        console.error("DELETE Error:", err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
