const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Get token from header
    let token = req.header('x-auth-token');

    // Also check standard Authorization header (Bearer <token>)
    if (!token && req.header('Authorization')) {
        const authHeader = req.header('Authorization');
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else {
            token = authHeader;
        }
    }

    // Check if no token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
