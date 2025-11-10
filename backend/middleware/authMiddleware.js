// backend/controllers/adminController.js
// CommonJS style to match your project

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, error: 'No token provided' });
  }

  const token = authHeader.substring(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ ok: false, error: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, error: 'Invalid token' });
  }
};

/**
 * GET /api/admin/me
 * Returns the profile of the logged-in admin (req.user is populated by authMiddleware)
 */
const getAdminProfile = async (req, res) => {
  try {
    // req.user was set by your authMiddleware (it returns a Mongoose doc)
    if (!req.user) {
      return res.status(401).json({ ok: false, error: 'Not authenticated' });
    }

    // Make sure we re-query the DB to return freshest data (omit password & sensitive fields)
    const admin = await User.findById(req.user._id).select('-password -resetToken -resetTokenExpiry');
    if (!admin) {
      return res.status(404).json({ ok: false, error: 'Admin not found' });
    }

    // return admin object
    return res.status(200).json({ ok: true, admin });
  } catch (err) {
    console.error('getAdminProfile error:', err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
};

/**
 * GET /api/admin/users
 * Returns all users (admin-only)
 */
const getAllUsers = async (req, res) => {
  try {
    // safety: verify req.user exists (should be ensured by middleware chain)
    if (!req.user) {
      return res.status(401).json({ ok: false, error: 'Not authenticated' });
    }

    // Query all users - exclude password and reset tokens
    const users = await User.find().select('-password -resetToken -resetTokenExpiry').sort({ createdAt: -1 });

    return res.status(200).json({ ok: true, users });
  } catch (err) {
    console.error('getAllUsers error:', err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
};

const verifyAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ ok: false, error: 'Not authenticated' });
    }

    const allowedRoles = ['superadmin', 'admin', 'manager'];
    if (req.user.role && allowedRoles.includes(String(req.user.role).toLowerCase())) {
      return next();
    }

    return res.status(403).json({ ok: false, error: 'Access denied: Admins only' });
  } catch (err) {
    console.error('verifyAdmin error:', err && err.message ? err.message : err);
    return res.status(403).json({ ok: false, error: 'Access denied' });
  }
};

const verifySuperAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ ok: false, error: 'Not authenticated' });
    }

    if (req.user.role && String(req.user.role).toLowerCase() === 'superadmin') {
      return next();
    }

    return res.status(403).json({ ok: false, error: 'Access denied: Superadmins only' });
  } catch (err) {
    console.error('verifySuperAdmin error:', err && err.message ? err.message : err);
    return res.status(403).json({ ok: false, error: 'Access denied' });
  }
};
module.exports = {
  authMiddleware,
  verifyAdmin,
  verifySuperAdmin,
};
