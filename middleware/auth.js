const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_change_this';

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log('[DEBUG] authenticateToken - Token received:', token ? 'Yes' : 'No');

    if (!token) {
        console.log('[DEBUG] authenticateToken - No token provided');
        return res.sendStatus(401);
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.log('[DEBUG] authenticateToken - Token verification failed:', err.message);
            return res.sendStatus(403);
        }
        console.log('[DEBUG] authenticateToken - Token verified for user:', user.email);
        req.user = user;
        next();
    });
}

module.exports = { authenticateToken, JWT_SECRET };
