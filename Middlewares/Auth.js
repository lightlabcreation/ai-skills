import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access Denied: No Token Provided or Invalid Format!' });
    }

    try {
        const authToken = token.replace('Bearer ', '');
        const verified = jwt.verify(authToken, process.env.ACCESS_TOKEN_SECRET);
        req.user = verified;
        next(); 
    } catch (error) {
        return res.status(400).json({ message: 'Invalid Token' });
    }
};


