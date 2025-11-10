const express = require('express');
const { authMiddleware, verifyAdmin, verifySuperAdmin } = require('../middleware/authMiddleware');
const {
  getAdminProfile,
  getAllUsers,
  getAdminStats,
  getAllFeedback,
  getAllSessions,
  getSessionChats,
  updateUser,
  deleteUser,
  getAllAdmins,
  addAdmin
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require authentication
router.use(authMiddleware);

// Profile routes
router.get('/me', getAdminProfile);

// Stats route (requires admin role)
router.get('/stats', verifyAdmin, getAdminStats);

// User management (requires admin role)
router.get('/users', verifyAdmin, getAllUsers);
router.put('/users/:id', verifyAdmin, updateUser);
router.delete('/users/:id', verifyAdmin, deleteUser);

// Admin management (requires superadmin)
router.get('/admins', verifySuperAdmin, getAllAdmins);
router.post('/admins', verifySuperAdmin, addAdmin);

// Feedback and sessions (requires admin role)
router.get('/feedback', verifyAdmin, getAllFeedback);
router.get('/sessions', verifyAdmin, getAllSessions);
router.get('/chats/:sessionId', verifyAdmin, getSessionChats);

// Legacy dashboard route (for backward compatibility)
router.get('/dashboard', verifyAdmin, async (req, res) => {
  try {
    const totalUsers = await require('../models/User').countDocuments();
    res.json({ totalUsers, status: 'ok' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// System info
router.get('/system', verifyAdmin, (req, res) => {
  res.json({ uptime: process.uptime(), status: 'Running' });
});

module.exports = router;
