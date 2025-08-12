const express = require('express');
const router = express.Router();
const Asset = require('../models/Asset');

// === GET /api/assets ===
// Fetches all asset reports. Supports filtering by placeName.
router.get('/assets', async (req, res) => {
    try {
        let filter = {};
        if (req.query.placeName) {
            filter.placeName = req.query.placeName;
        }
        const items = await Asset.find(filter).sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        console.error("Error fetching assets:", err);
        res.status(500).json({ msg: 'Server error while fetching reports' });
    }
});

// === POST /api/assets ===
// Submits a new asset report. This is the handler for your form.
router.post('/assets', async (req, res) => {
    try {
        const newAsset = new Asset({
            assetType: req.body.assetType,
            placeName: req.body.placeName,
            location: req.body.location,
            hasVisited: req.body.hasVisited,
            visitFrequency: req.body.visitFrequency,
            lastVisitDate: req.body.lastVisitDate,
            seasonOfVisit: req.body.seasonOfVisit,
            overallSatisfaction: req.body.overallSatisfaction,
            wouldRecommend: req.body.wouldRecommend,
            bestThing: req.body.bestThing,
            improvements: req.body.improvements
        });

        const item = await newAsset.save();
        res.status(201).json(item); // Respond with "201 Created" on success

    } catch (err) {
        console.error("Error saving asset:", err);
        res.status(400).json({ msg: 'Error saving to database', error: err.message });
    }
});

module.exports = router;