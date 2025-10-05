// backend/routes/auth/listUsers.js
const express = require('express');
const router = express.Router();
const User = require('../../models/User');

router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password -resetToken -resetTokenExpiry');
    res.json({ ok: true, users });
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

module.exports = router;
