// backend/models/Chat.js
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    message: { type: String, required: true }, // chat message text
    sender: { type: String, enum: ['user', 'bot', 'admin'], required: true }, // who sent the message
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true }, // link to chat session
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // link to user
  },
  {
    timestamps: { createdAt: 'timestamp', updatedAt: 'updated_at' }, // auto-manages timestamp
  }
);

module.exports = mongoose.model('Chat', chatSchema);
