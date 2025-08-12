const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// --- Middleware ---
// Enable Cross-Origin Resource Sharing for all routes
app.use(cors());
// Enable the express server to parse incoming JSON payloads
app.use(express.json());

// ***************************************************************
// *** THIS IS THE CRITICAL CHANGE ***
// We define the API routes BEFORE the static file server.
// ***************************************************************

// --- API Routes ---
// This line now comes FIRST.
// It tells Express that any request starting with '/api' should be handled by the 'routes/api.js' file.
app.use('/api', require('./routes/api'));


// --- Static File Server ---
// This line now comes LAST.
// It will serve all static files (like index.html) for any request that IS NOT an API route.
app.use(express.static('public'));


// --- Database Configuration ---
const db = process.env.MONGO_URI;

// --- Connect to MongoDB ---
mongoose
    .connect(db)
    .then(() => console.log('MongoDB Connected Successfully...'))
    .catch(err => console.log('MongoDB Connection Error:', err));


// --- Server Definition ---
const port = process.env.PORT || 5500; // Use port 5500 for local development
app.listen(port, () => console.log(`Server started and running on port ${port}`));