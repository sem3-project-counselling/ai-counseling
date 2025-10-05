// backend/api/mongo_routes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const Session = require('../models/Session');
const CareerTest = require('../models/CareerTest');
const Recommendation = require('../models/Recommendation');
const Feedback = require('../models/Feedback');
const Chat = require('../models/Chat');

// -------------------- USERS --------------------
router.post('/users', authMiddleware, async (req, res) => {
  if (!req.body.name || !req.body.email) return res.status(400).json({ ok: false, error: 'Missing name or email' });
  try {
    const user = await User.create(req.body);
    res.json({ ok: true, user });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.get('/users/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -resetToken -resetTokenExpiry').lean();
    if (!user) return res.status(404).json({ ok: false, error: 'User not found' });
    res.json({ ok: true, user });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// -------------------- SESSIONS --------------------
router.post('/sessions', authMiddleware, async (req, res) => {
  if (!req.body.duration) return res.status(400).json({ ok: false, error: 'Missing session duration' });
  try {
    const session = await Session.create({ ...req.body, userId: req.user._id });
    res.json({ ok: true, session });
  } catch (err) {
    console.error('Create session error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.get('/sessions/:id', authMiddleware, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).lean();
    if (!session) return res.status(404).json({ ok: false, error: 'Session not found' });
    res.json({ ok: true, session });
  } catch (err) {
    console.error('Get session error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// -------------------- CAREER TESTS --------------------
router.post('/career_tests', authMiddleware, async (req, res) => {
  try {
    const test = await CareerTest.create({ ...req.body, userId: req.user._id });
    res.json({ ok: true, test });
  } catch (err) {
    console.error('Create career test error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.get('/career_tests/:id', authMiddleware, async (req, res) => {
  try {
    const test = await CareerTest.findById(req.params.id).lean();
    if (!test) return res.status(404).json({ ok: false, error: 'Career test not found' });
    res.json({ ok: true, test });
  } catch (err) {
    console.error('Get career test error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// -------------------- RECOMMENDATIONS --------------------
router.post('/recommendations', authMiddleware, async (req, res) => {
  try {
    const recommendation = await Recommendation.create({ ...req.body, userId: req.user._id });
    res.json({ ok: true, recommendation });
  } catch (err) {
    console.error('Create recommendation error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.get('/recommendations/:id', authMiddleware, async (req, res) => {
  try {
    const recommendation = await Recommendation.findById(req.params.id).lean();
    if (!recommendation) return res.status(404).json({ ok: false, error: 'Recommendation not found' });
    res.json({ ok: true, recommendation });
  } catch (err) {
    console.error('Get recommendation error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// -------------------- FEEDBACK --------------------
router.post('/feedback', authMiddleware, async (req, res) => {
  try {
    const feedback = await Feedback.create({ ...req.body, userId: req.user._id });
    res.json({ ok: true, feedback });
  } catch (err) {
    console.error('Create feedback error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// -------------------- CHATS --------------------
router.post('/chats', authMiddleware, async (req, res) => {
  try {
    const chat = await Chat.create({ ...req.body, userId: req.user._id });
    res.json({ ok: true, chat });
  } catch (err) {
    console.error('Create chat error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
