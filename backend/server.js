require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { connect } = require('./lib/mongodb');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();

// ==============================
// ⚙️ Middleware
// ==============================
app.use(express.json());
app.use(cookieParser());

const FRONTEND_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);

// ==============================
// 💾 MongoDB Connection
// ==============================
connect()
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// ==============================
// 🚀 ROUTES
// ==============================
try {
  app.use('/api/auth/verify-token', require('./routes/auth/verify-token'));
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/admin', require('./routes/adminRoutes'));
  app.use('/api/careerTest', require('./routes/careerTest_routes'));
  app.use('/api/recommendation', require('./routes/recommendation_routes'));
  app.use('/api/feedback', require('./routes/feedback_routes'));
  app.use('/api/chat', require('./routes/chat_routes'));
} catch (err) {
  console.warn('⚠️ Some optional routes missing.');
}

// =====================================
// 🧠 AI Counselling Stream Route
// =====================================
const counsellingRouter = require('./ai/counselling');
app.use('/api/ai', counsellingRouter);

// ==============================
// 🩺 Health
// ==============================
app.get('/api/health', (req, res) => res.json({ ok: true }));

// ==============================
// 🚀 Start Server
// ==============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
