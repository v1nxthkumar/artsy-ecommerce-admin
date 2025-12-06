import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Not Authorized. Token missing or malformed.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.id; // or store the whole payload: req.user = decoded;
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ success: false, message: 'Invalid token. Please login again.' });
    }
};

export default authUser;
