const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AssetSchema = new Schema({
    // 1. Asset Information
    assetType: {
        type: String,
        required: true
    },
    placeName: {
        type: String,
        required: true
    },
    location: {
        type: String, // This will store the coordinates
        required: true
    },
    // The 'country' field has been REMOVED.

    // 2. Visit Details
    hasVisited: {
        type: String, // "Yes" or "No"
        required: true
    },
    visitFrequency: {
        type: String,
        required: false
    },
    lastVisitDate: {
        type: Date,
        required: false
    },
    seasonOfVisit: {
        type: String,
        required: false
    },

    // 3. Feedback & Ratings
    overallSatisfaction: {
        type: Number,
        required: false
    },
    wouldRecommend: {
        type: String,
        required: false
    },
    bestThing: {
        type: String,
        required: false
    },
    improvements: {
        type: String,
        required: false
    }

}, { timestamps: true });

const Asset = mongoose.model('Asset', AssetSchema);

module.exports = Asset;