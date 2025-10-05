// backend/lib/mongodb.js
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

module.exports = {
  connect: async function () {
    if (!uri) {
      throw new Error('❌ MONGODB_URI not set in .env file');
    }

    try {
      await mongoose.connect(uri);
      console.log('✅ Connected to MongoDB Atlas');
    } catch (err) {
      console.error('❌ MongoDB connection failed:', err.message);
      process.exit(1);
    }
  },
  mongoose,
};
