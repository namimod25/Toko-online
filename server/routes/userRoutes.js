const express = require('express');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');

const router = express.Router();


router.get('/dashboard', authenticateToken, authorize(['user']), (req, res) => {
    res.json({
        message: 'User dashboard - Welcome user!'
    });
});

// hanya untuk admin role
router.get('/admin-dashboard', authenticateToken, authorize(['admin']), (req, res) => {
    res.json({
        message: 'Admin dashboard - Welcome admin!'
    });
});

// Route untuk admin dan moderator
router.get('/manage-users', authenticateToken, authorize(['admin', 'moderator']), (req, res) => {
    res.json({
        message: 'User management panel'
    });
});

module.exports = router;