const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const { authMiddleware } = require('../../middleware/authMiddleware');

// GET /api/auth/user/:id - Get user by ID (authenticated users only)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;

    // Ensure user can only access their own data or admin can access any
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ ok: false, error: 'Access denied' });
    }

    const user = await User.findById(userId).select('-password -resetToken -resetTokenExpiry');
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    res.json({ ok: true, user });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

module.exports = router;
