const jwt = require("jsonwebtoken");

const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  console.log("🔍 Authorization Header:", authHeader); // ✅ Debug Header ที่ส่งมาจาก Frontend

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1]; // แยก "Bearer <token>"
  console.log("✅ Extracted Token:", token); // ✅ Debug Token ที่ถูกอ่าน

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = authenticateAdmin;
