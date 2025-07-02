const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db"); // เชื่อมกับ Database
const router = express.Router();

// SECRET KEY สำหรับ JWT
const JWT_SECRET = "your-secret-key";

// ✅ [POST] Admin Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // ค้นหา Admin จาก Database
        const result = await pool.query("SELECT * FROM admin WHERE email = $1", [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const admin = result.rows[0];

        // ตรวจสอบรหัสผ่าน
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // สร้าง JWT Token
        const token = jwt.sign({ adminId: admin.id, email: admin.email }, JWT_SECRET, {
            expiresIn: "1h",
        });

        res.json({ message: "Login successful", token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
