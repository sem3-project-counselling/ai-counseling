// backend/routes/auth/register.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS || 10);

router.post('/', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ ok: false, error: 'Missing required fields' });

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ ok: false, error: 'Email already in use' });

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({ name, email, password: hashed, role: role || 'client' });
    await user.save();

    const token = jwt.sign({ sub: user._id, email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ ok: true, userId: user._id, token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

module.exports = router;
