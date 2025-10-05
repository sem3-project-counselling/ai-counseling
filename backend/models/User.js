// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // full name
    email: { type: String, required: true, unique: true }, // unique email
    password: { type: String, required: true }, // hashed password
    resetToken: { type: String, default: null }, // for password reset
    resetTokenExpiry: { type: Date, default: null }, // expiration for reset token
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }, // automatic timestamps
  }
);

module.exports = mongoose.model('User', userSchema);
