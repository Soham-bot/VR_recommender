const express = require('express');
const router = express.Router();

// GET /api/users/profile
router.get('/profile', (req, res) => {
    res.json({
        success: true,
        data: {
            id: 1,
            name: "VR Explorer",
            preferences: {
                ageGroup: "young-adult",
                primaryInterest: "gaming"
            }
        }
    });
});

// PUT /api/users/preferences
router.put('/preferences', (req, res) => {
    const { preferences } = req.body;
    res.json({
        success: true,
        message: "Preferences updated",
        data: preferences
    });
});

module.exports = router;