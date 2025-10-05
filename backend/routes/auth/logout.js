// backend/routes/auth/logout.js
const express = require('express');
const router = express.Router();

// This is a placeholder; JWT logout is handled on client side by deleting the token
router.post('/', (req, res) => {
  res.json({ ok: true, message: 'Logged out' });
});

module.exports = router;
