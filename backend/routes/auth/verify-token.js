const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

router.post('/', (req, res) => {
  try {
    const { token } = req.body;
    console.log("Received token:", token ? token.slice(0, 30) + "..." : "none");

    if (!token) {
      console.log("❌ Missing token in request body");
      return res.status(400).json({ ok: false, error: 'Missing token' });
    }

    // Try verifying
    const payload = jwt.verify(token, JWT_SECRET);
    console.log("✅ Token verified successfully:", payload);

    return res.json({ ok: true, payload });

  } catch (error) {
    console.error("❌ Token verification failed:", error.message);
    return res.status(401).json({ ok: false, error: error.message });
  }
});

module.exports = router;
