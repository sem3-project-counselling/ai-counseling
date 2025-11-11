// backend/models/Feedback.js
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    comments: { type: String, required: false }, // optional feedback comments
    rating: { type: Number, min: 1, max: 5, required: true }, // enforce rating scale (1–5)
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: false }, // feedback optionally linked to a session
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // feedback belongs to user
  },
  {
    timestamps: { createdAt: 'submitted_at', updatedAt: 'updated_at' }, // auto timestamps
  }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
