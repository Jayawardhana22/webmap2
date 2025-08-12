const express = require('express');
const router = express.Router();
// IMPORTANT: Change this to require the new Asset model
const Asset = require('../models/Asset');

// GET route: To fetch all asset reports (with filtering)
router.get('/assets', async (req, res) => {
    try {
        let filter = {};
        // Allow filtering by placeName for the analysis page
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

// POST route: To submit a new asset report
router.post('/assets', async (req, res) => {
    try {
        const newAsset = new Asset({
            // Section 1
            assetType: req.body.assetType,
            placeName: req.body.placeName,
            location: req.body.location,
            country: req.body.country,

            // Section 2
            hasVisited: req.body.hasVisited,
            visitFrequency: req.body.visitFrequency,
            lastVisitDate: req.body.lastVisitDate,
            seasonOfVisit: req.body.seasonOfVisit,

            // Section 3
            overallSatisfaction: req.body.overallSatisfaction,
            wouldRecommend: req.body.wouldRecommend,
            bestThing: req.body.bestThing,
            improvements: req.body.improvements
        });

        const item = await newAsset.save();
        res.status(201).json(item);

    } catch (err) {
        console.error("Error saving asset:", err);
        res.status(400).json({ msg: 'Error saving to database', error: err.message });
    }
});

module.exports = router;