// backend/routes/auth_routes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS || 10);

// -------------------- REGISTER --------------------
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ ok: false, error: 'Missing required fields' });

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ ok: false, error: 'Email already in use' });

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({ name, email, password: hashed });
    await user.save();

    const token = jwt.sign({ sub: user._id, email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ ok: true, userId: user._id, token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// -------------------- LOGIN --------------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ ok: false, error: 'Missing credentials' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ ok: false, error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ ok: false, error: 'Invalid credentials' });

    const token = jwt.sign({ sub: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ ok: true, token, userId: user._id, name: user.name, email: user.email });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// -------------------- DELETE USER --------------------
router.post('/delete-user', async (req, res) => {
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

// -------------------- VERIFY TOKEN --------------------
router.post('/verify-token', (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ ok: false, error: 'Missing token' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    res.json({ ok: true, payload });
  } catch {
    res.status(401).json({ ok: false, error: 'Invalid or expired token' });
  }
});

// -------------------- PASSWORD RESET REQUEST --------------------
router.post('/reset-password-request', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ ok: false, error: 'Missing email' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.json({ ok: true }); // Do not reveal existence

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + 1000 * 60 * 60; // 1 hour

    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || ''}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    // Only send email if SMTP configured
    if (process.env.SMTP_USER) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'no-reply@example.com',
        to: email,
        subject: 'Password reset',
        text: `Reset link: ${resetUrl}`,
        html: `<p>Reset link: <a href="${resetUrl}">${resetUrl}</a></p>`
      });
    } else {
      console.log('Reset URL (no SMTP configured):', resetUrl);
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Reset request error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// -------------------- PASSWORD RESET CONFIRM --------------------
router.post('/reset-password-confirm', async (req, res) => {
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword) return res.status(400).json({ ok: false, error: 'Missing parameters' });

  try {
    const user = await User.findOne({ email, resetToken: token });
    if (!user) return res.status(400).json({ ok: false, error: 'Invalid token' });
    if (user.resetTokenExpiry < Date.now()) return res.status(400).json({ ok: false, error: 'Token expired' });

    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ ok: true });
  } catch (err) {
    console.error('Reset confirm error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

module.exports = router;
