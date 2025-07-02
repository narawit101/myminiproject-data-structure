const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // ตรวจสอบอีเมลและรหัสผ่าน
  if (email === "admin@example.com" && password === "password123") {
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    console.log("✅ Token Generated:", token); // ✅ Debug ตรวจสอบว่า Token ถูกสร้างไหม

    return res.json({ token });
  }

  return res.status(401).json({ message: "Invalid email or password" });
});

module.exports = router;
