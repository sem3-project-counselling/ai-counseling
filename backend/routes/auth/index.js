// backend/routes/auth/index.js
const express = require('express');
const router = express.Router();

router.use('/register', require('./register'));
router.use('/login', require('./login'));
router.use('/logout', require('./logout'));
router.use('/reset-password', require('./resetPassword'));
router.use('/delete-user', require('./deleteUser'));
router.use('/list-users', require('./listUsers'));

module.exports = router;
