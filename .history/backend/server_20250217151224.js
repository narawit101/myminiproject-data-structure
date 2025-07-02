require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const pool = require('./db');
const citizensRoutes = require('./routes/citizens'); // Import routes
const budgetRoutes = require('./routes/budget');
const adminRoutes = require("./routes/admin"); // Import admin routes




const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// ทดสอบเชื่อมต่อฐานข้อมูล
pool.connect((err) => {
  if (err) {
    console.error('ไม่สามารถเชื่อมต่อฐานข้อมูล:', err);
  } else {
    console.log('เชื่อมต่อ PostgreSQL สำเร็จ');
  }
});

// ใช้งาน Router
app.use('/citizens', citizensRoutes);
app.use('/budget', budgetRoutes);

// เริ่มต้นเซิร์ฟเวอร์
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
