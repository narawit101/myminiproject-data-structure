const express = require('express');
const pool = require('../db'); // นำเข้า database connection
const router = express.Router();

// ฟังก์ชันคำนวณอายุจาก birth_date
const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--; // ถ้ายังไม่ถึงวันเกิดในปีนี้ ต้องลบออก 1
    }
    return age;
};

// ✅ API ดึงข้อมูลประชาชนทั้งหมด (คำนวณอายุอัตโนมัติ)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT *, AGE(birth_date) AS calculated_age FROM citizens ORDER BY created_at DESC');

        // แปลงค่าอายุจาก "XX years" เป็นตัวเลข
        const citizens = result.rows.map(citizen => ({
            ...citizen,
            age: parseInt(citizen.calculated_age.match(/\d+/)[0], 10) // ดึงตัวเลขจาก "22 years"
        }));

        res.json(citizens);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ✅ API เพิ่มข้อมูลประชาชนใหม่ (คำนวณอายุก่อนบันทึก)
router.post('/', async (req, res) => {
    try {
        const { fname, lname, national_id, birth_date, income, occupation, target_group_id } = req.body;
        const age = calculateAge(birth_date); // คำนวณอายุ

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

// ✅ API แก้ไขข้อมูลประชาชน (อัปเดตอายุตามวันเกิด)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { fname, lname, birth_date, income, occupation, target_group_id, bank_account } = req.body;
        const age = calculateAge(birth_date); // คำนวณอายุใหม่

        const result = await pool.query(
            `UPDATE citizens 
             SET fname = $1, lname = $2, birth_date = $3, age = $4, income = $5, occupation = $6, target_group_id = $7, bank_account = $8 
             WHERE citizen_id = $9 RETURNING *`,
            [fname, lname, birth_date, age, income, occupation, target_group_id, bank_account, id]
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

// ✅ API ลบข้อมูลประชาชน
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
