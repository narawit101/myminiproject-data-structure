require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const pool = require('./db');
const citizensRoutes = require('./routes/citizens'); 
const budgetRoutes = require('./routes/budget');
const adminRoutes = require("./routes/admin"); 
const allocationRoutes = require("./routes/allocation"); 
const transactionRoutes = require("./routes/transaction"); 
const generate_fake_citizensRoutes = require("./routes/generate_fake_citizens"); 

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

pool.connect((err) => {
  if (err) {
    console.error('ไม่สามารถเชื่อมต่อฐานข้อมูล:', err);
  } else {
    console.log('เชื่อมต่อ PostgreSQL สำเร็จ');
  }
});

app.use('/citizens', citizensRoutes);
app.use('/budget', budgetRoutes);
app.use('/admin', adminRoutes); 
app.use('/allocation', allocationRoutes); 
app.use('/transaction', transactionRoutes); 
app.use('/generate_fake_citizens', generate_fake_citizensRoutes); 

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
