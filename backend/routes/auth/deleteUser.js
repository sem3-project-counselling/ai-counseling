// backend/routes/auth/deleteUser.js
const express = require('express');
const router = express.Router();
const User = require('../../models/User');

router.post('/', async (req, res) => {
  const { uid } = req.body;
  if (!uid) return res.status(400).json({ ok: false, error: 'UID is required' });

  try {
    const result = await User.deleteOne({ _id: uid });
    res.json({ ok: true, deletedCount: result.deletedCount });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

module.exports = router;
