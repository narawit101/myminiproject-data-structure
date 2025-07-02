const secretCode = process.env.SECRET_CODE;

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || authHeader !== `Bearer ${secretCode}`) {
        return res.status(403).json({ message: "รหัสลับไม่ถูกต้อง!" });
    }
    
    next();
};

module.exports = authenticate;
