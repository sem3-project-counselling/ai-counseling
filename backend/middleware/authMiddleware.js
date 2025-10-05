// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

/**
 * Middleware to verify JWT token from headers or cookies.
 * If valid, attaches user object to req.user
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Check Authorization header first
    const authHeader = req.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) return res.status(401).json({ ok: false, error: 'Missing token' });

    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user object to request
    const user = await User.findById(decoded.sub).select('-password -resetToken -resetTokenExpiry');
    if (!user) return res.status(401).json({ ok: false, error: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    return res.status(401).json({ ok: false, error: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
