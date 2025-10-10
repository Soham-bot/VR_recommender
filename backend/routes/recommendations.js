const express = require('express');
const router = express.Router();

// POST /api/recommendations/generate
router.post('/generate', (req, res) => {
    const { preferences } = req.body;
    
    // Mock AI recommendation logic
    const recommendations = [
        {
            id: 1,
            title: "Beat Saber",
            matchScore: 95,
            reason: "Perfect match for your gaming preferences"
        },
        {
            id: 2,
            title: "Half-Life: Alyx",
            matchScore: 88,
            reason: "Great adventure experience for VR enthusiasts"
        }
    ];
    
    res.json({
        success: true,
        data: recommendations,
        preferences: preferences
    });
});

// GET /api/recommendations/popular
router.get('/popular', (req, res) => {
    res.json({
        success: true,
        data: [
            { id: 1, title: "Beat Saber", popularity: 95 },
            { id: 2, title: "Half-Life: Alyx", popularity: 92 }
        ]
    });
});

module.exports = router;