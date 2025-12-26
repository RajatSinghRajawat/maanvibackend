const express = require('express');
const router = express.Router();
const { login, register, getMe } = require('../controller/admin');
const { protect } = require('../middleware/auth');

// @route   POST /api/admin/login
router.post('/login', login);

// @route   POST /api/admin/register
router.post('/register', register);

// @route   GET /api/admin/me
router.get('/me', protect, getMe);

module.exports = router;

