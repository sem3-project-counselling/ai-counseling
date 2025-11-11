const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Chat = require('../../models/Chat');
const Feedback = require('../../models/Feedback');
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

// GET /api/auth/user/:id/chats - Get user's chat history
router.get('/:id/chats', authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;

    // Ensure user can only access their own data or admin can access any
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ ok: false, error: 'Access denied' });
    }

    const chats = await Chat.find({ userId }).populate('sessionId', 'title').sort({ timestamp: -1 });
    res.json({ ok: true, chats });
  } catch (err) {
    console.error('Get chats error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// GET /api/auth/user/:id/feedback - Get user's feedback
router.get('/:id/feedback', authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;

    // Ensure user can only access their own data or admin can access any
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ ok: false, error: 'Access denied' });
    }

    const feedback = await Feedback.find({ userId }).populate('sessionId', 'title').sort({ submitted_at: -1 });
    res.json({ ok: true, feedback });
  } catch (err) {
    console.error('Get feedback error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// POST /api/auth/user/:id/feedback - Submit new feedback
router.post('/:id/feedback', authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    const { comments, rating, sessionId } = req.body;

    // Ensure user can only submit for themselves or admin can submit for any
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ ok: false, error: 'Access denied' });
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ ok: false, error: 'Rating must be between 1 and 5' });
    }

    const newFeedback = new Feedback({
      comments: comments || '',
      rating,
      sessionId: sessionId || null,
      userId,
    });

    await newFeedback.save();
    res.status(201).json({ ok: true, feedback: newFeedback });
  } catch (err) {
    console.error('Submit feedback error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

module.exports = router;
