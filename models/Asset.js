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
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },

    // 2. Visit Details
    hasVisited: {
        type: String, // "Yes" or "No"
        required: true
    },
    visitFrequency: {
        type: String,
        required: false // Only required if hasVisited is "Yes"
    },
    lastVisitDate: {
        type: Date,
        required: false // Only required if hasVisited is "Yes"
    },
    seasonOfVisit: {
        type: String,
        required: false // Only required if hasVisited is "Yes"
    },

    // 3. Feedback & Ratings
    overallSatisfaction: {
        type: Number, // Storing stars as a number 1-5
        required: false // Only required if hasVisited is "Yes"
    },
    wouldRecommend: {
        type: String, // "Yes" or "No"
        required: false // Only required if hasVisited is "Yes"
    },
    bestThing: {
        type: String,
        required: false
    },
    improvements: {
        type: String,
        required: false
    }

    // Note: We are not including photo upload in this version to keep it simple
    // and avoid the complexity of file storage on free hosting services.

}, { timestamps: true }); // timestamps adds createdAt and updatedAt

const Asset = mongoose.model('Asset', AssetSchema);

module.exports = Asset;