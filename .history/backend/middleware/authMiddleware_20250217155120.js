const secretCode = process.env.SECRET_CODE;

const authenticate = (req, res, next) => {
    console.log("🔹 Header secret:", req.headers.secret);
    console.log("🔹 ENV SECRET_CODE:", secretCode);

    if (!req.headers.secret || req.headers.secret !== secretCode) {
        return res.status(403).json({ message: "รหัสลับไม่ถูกต้อง!" });
    }
    next();
};

module.exports = authenticate;
