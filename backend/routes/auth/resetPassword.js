// backend/routes/auth/resetPassword.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS || 10);

// Request reset
router.post('/request', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ ok: false, error: 'Missing email' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.json({ ok: true }); // do not reveal existence

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + 1000 * 60 * 60; // 1 hour

    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    console.log('Generated reset token:', token); // For testing purposes
    console.log('Reset URL:', resetUrl); // For testing purposes

    if (process.env.SMTP_USER && process.env.SMTP_HOST && process.env.SMTP_HOST !== 'smtp.example.com' && process.env.SMTP_HOST !== '') {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      });

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || 'no-reply@example.com',
          to: email,
          subject: 'Password reset',
          text: `Reset link: ${resetUrl}`,
          html: `<p>Reset link: <a href="${resetUrl}">${resetUrl}</a></p>`
        });
        console.log('Password reset email sent successfully');
      } catch (emailErr) {
        console.error('Failed to send password reset email:', emailErr);
        // Do not fail the request if email sending fails
      }
    } else {
      console.log('Reset URL (no SMTP configured):', resetUrl);
    }

    // For testing purposes, return the token in the response
    res.json({ ok: true });
  } catch (err) {
    console.error('Reset request error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Confirm reset
router.post('/confirm', async (req, res) => {
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
