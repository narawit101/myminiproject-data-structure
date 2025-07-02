require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// ทดสอบเชื่อมต่อฐานข้อมูล
pool.connect((err) => {
  if (err) {
    console.error('\u274C ไม่สามารถเชื่อมต่อฐานข้อมูล:', err);
  } else {
    console.log('\u2705 เชื่อมต่อ PostgreSQL สำเร็จ');
  }
});
// API ดึงข้อมูลประชาชนทั้งหมด
app.get('/citizens', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM citizens ORDER BY created_at DESC');
      res.json(result.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
  
  // API เพิ่มข้อมูลประชาชนใหม่
  app.post('/citizens', async (req, res) => {
    try {
      const { name, national_id, birth_date, income, occupation, target_group, bank_account } = req.body;
      const newCitizen = await pool.query(
        `INSERT INTO citizens (name, national_id, birth_date, income, occupation, target_group, bank_account)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [name, national_id, birth_date, income, occupation, target_group, bank_account]
      );
      res.json(newCitizen.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
  
  // API แก้ไขข้อมูลประชาชน
  app.put('/citizens/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, income, occupation, target_group, bank_account } = req.body;
      await pool.query(
        `UPDATE citizens SET name = $1, income = $2, occupation = $3, target_group = $4, bank_account = $5 WHERE citizen_id = $6`,
        [name, income, occupation, target_group, bank_account, id]
      );
      res.json({ message: 'อัปเดตข้อมูลสำเร็จ' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
  
  // API ลบข้อมูลประชาชน
  app.delete('/citizens/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM citizens WHERE citizen_id = $1', [id]);
      res.json({ message: 'ลบข้อมูลสำเร็จ' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
  
  // เริ่มต้นเซิร์ฟเวอร์
  app.listen(PORT, () => {
    console.log(`\uD83D\uDE80 Server is running on port ${PORT}`);
  });