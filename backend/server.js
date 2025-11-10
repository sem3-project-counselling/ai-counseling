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
app.post('/api/ai/ask', async (req, res) => {
  const { question } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3',
        prompt: `You are an empathetic AI career counsellor.\nUser asked: ${question}`,
        stream: true,
      }),
    });

    if (!response.ok) throw new Error(`Ollama API error: ${response.status}`);

    for await (const chunk of response.body) {
      const text = chunk.toString();
      const lines = text.trim().split('\n');
      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (data.response) res.write(`data: ${data.response}\n\n`);
        } catch {
          // ignore invalid lines
        }
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Streaming error:', err.message);
    res.write('data: [ERROR]\n\n');
    res.end();
  }
});

// ==============================
// 🩺 Health
// ==============================
app.get('/api/health', (req, res) => res.json({ ok: true }));

// ==============================
// 🚀 Start Server
// ==============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
