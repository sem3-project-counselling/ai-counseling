// backend/models/CareerTest.js
const mongoose = require('mongoose');

const careerTestSchema = new mongoose.Schema(
  {
    answers: { type: Object, default: {} }, // user’s answers
    score: { type: Number, required: false }, // optional test score
    suggested_fields: [{ type: String }], // recommended career fields
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // link to user
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

module.exports = mongoose.model('CareerTest', careerTestSchema);
