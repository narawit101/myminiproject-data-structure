// ฟังก์ชันคำนวณอายุจาก birth_date
const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

// เพิ่มข้อมูลประชาชน
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

// อัปเดตข้อมูลประชาชน
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { fname, lname, birth_date, income, occupation, target_group_id, bank_account } = req.body;
        const age = birth_date ? calculateAge(birth_date) : null; // คำนวณอายุถ้ามีการส่ง birth_date มา

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
