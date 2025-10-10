const express = require('express');
const router = express.Router();

// Sample VR experiences data
const vrExperiences = [
    {
        id: 1,
        title: "Beat Saber",
        description: "Rhythm VR game where you slash beats with lightsabers",
        category: "Gaming",
        rating: 4.8,
        price: 29.99,
        platform: "Steam VR, Oculus, PlayStation VR",
        officialUrl: "https://beatsaber.com/"
    },
    {
        id: 2,
        title: "Half-Life: Alyx",
        description: "Immersive VR adventure set in the Half-Life universe",
        category: "Adventure",
        rating: 4.9,
        price: 59.99,
        platform: "Steam VR, Oculus",
        officialUrl: "https://store.steampowered.com/app/546560/HalfLife_Alyx/"
    },
    {
        id: 3,
        title: "SUPERHOT VR",
        description: "Time moves only when you move. Dodge bullets, take down enemies, and navigate through a stylized world",
        category: "Gaming",
        rating: 4.7,
        price: 24.99,
        platform: "Steam VR, Oculus Quest, PSVR",
        officialUrl: "https://store.steampowered.com/app/617830/SUPERHOT_VR/"
    },
    {
        id: 4,
        title: "Population: One",
        description: "Climb anything. Fight everywhere. Experience battle royale like never before with vertical combat in VR",
        category: "Gaming",
        rating: 4.5,
        price: 29.99,
        platform: "Oculus Quest, Oculus Rift",
        officialUrl: "https://www.oculus.com/experiences/quest/2564158073609422/"
    }
];

// GET /api/vr-experiences
router.get('/', (req, res) => {
    res.json({
        success: true,
        data: vrExperiences,
        count: vrExperiences.length
    });
});

// GET /api/vr-experiences/:id
router.get('/:id', (req, res) => {
    const experience = vrExperiences.find(exp => exp.id === parseInt(req.params.id));
    if (!experience) {
        return res.status(404).json({ error: 'VR experience not found' });
    }
    res.json({ success: true, data: experience });
});

module.exports = router;