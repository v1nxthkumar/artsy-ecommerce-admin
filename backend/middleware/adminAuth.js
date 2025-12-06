import jwt from 'jsonwebtoken';

const adminAuth = async (req, res, next) => {
    try {
        // ✅ Use standard "Authorization: Bearer <token>" header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Not Authorized. Login Again." });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ✅ Ensure token contains admin email
        if (decoded.email !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({ success: false, message: "Not Authorized. Login Again!" });
        }

        req.admin = decoded; // Optional: attach admin info to request
        next();
    } catch (error) {
        console.error("Admin Auth Error:", error.message);
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

export default adminAuth;
