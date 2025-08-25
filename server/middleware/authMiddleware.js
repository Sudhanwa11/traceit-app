// server/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // 1. Get token from header
    const token = req.header('x-auth-token');

    // 2. Check if token doesn't exist
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // 3. If token exists, verify it
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Add the user payload from the token to the request object
        req.user = decoded.user;
        next(); // Move to the next piece of middleware/route handler
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};