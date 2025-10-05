// backend/index.js
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { connect } = require('./lib/mongodb');  // MongoDB connection function

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS setup
const FRONTEND_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true, // allow cookies/headers
  })
);

// Connect to MongoDB Atlas
connect()
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', require('./routes/auth')); 

// Other resource routes (make sure these route files exist)
try {
  app.use('/api/careerTest', require('./routes/careerTest_routes'));
  app.use('/api/recommendation', require('./routes/recommendation_routes'));
  app.use('/api/feedback', require('./routes/feedback_routes'));
  app.use('/api/chat', require('./routes/chat_routes'));
} catch (err) {
  console.warn('⚠️ Some routes not found. Skip until implemented.');
}

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
