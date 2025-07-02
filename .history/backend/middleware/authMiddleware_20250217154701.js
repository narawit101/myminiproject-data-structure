const secretCode = process.env.SECRET_CODE;

const authenticate = (req, res, next) => {
    const secret = req.headers.secret; // ✅ อ่านค่าให้ถูกต้อง

    if (!secret || secret !== secretCode) {
        return res.status(403).json({ message: "รหัสลับไม่ถูกต้อง!" });
    }
    next();
};

module.exports = authenticate;
