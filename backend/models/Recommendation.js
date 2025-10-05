// backend/models/Recommendation.js
const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema(
  {
    based_on_test: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'CareerTest', 
      required: true 
    }, // link to career test
    explanation: { type: String, required: true }, // why this recommendation
    recommended_careers: [{ type: String, required: true }], // suggested careers
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    }, // owner of recommendation
  },
  {
    timestamps: { createdAt: 'timestamp', updatedAt: 'updated_at' }, // auto timestamps
  }
);

module.exports = mongoose.model('Recommendation', recommendationSchema);
