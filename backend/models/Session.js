// backend/models/Session.js
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    completed: { type: Boolean, default: false }, // whether session was finished
    duration: { type: Number, required: false }, // duration in minutes/seconds
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    }, // session belongs to user
  },
  {
    timestamps: { createdAt: 'started_at', updatedAt: 'updated_at' }, // auto manage start & update times
  }
);

module.exports = mongoose.model('Session', sessionSchema);
