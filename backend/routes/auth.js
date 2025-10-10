const express = require('express');
const router = express.Router();

// GET /api/auth/status
router.get('/status', (req, res) => {
    res.json({ message: 'Auth service is running' });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
    res.json({ message: 'Login endpoint' });
});

// POST /api/auth/register
router.post('/register', (req, res) => {
    res.json({ message: 'Register endpoint' });
});

module.exports = router;