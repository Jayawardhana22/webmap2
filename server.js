const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// --- Middleware ---
// Enable Cross-Origin Resource Sharing for all routes
app.use(cors());
// Enable the express server to parse incoming JSON payloads
app.use(express.json());
// Serve all static files (like index.html, app.js, style.css) from the 'public' folder
app.use(express.static('public'));

// --- Database Configuration ---
// Get the MongoDB connection string from environment variables
const db = process.env.MONGO_URI;

// --- Connect to MongoDB ---
mongoose
    .connect(db)
    .then(() => console.log('MongoDB Connected Successfully...'))
    .catch(err => console.log('MongoDB Connection Error:', err));

// --- API Routes ---
// This is the most critical line.
// It tells Express that any request starting with '/api' should be handled by the 'routes/api.js' file.
app.use('/api', require('./routes/api'));

// --- Server Definition ---
const port = process.env.PORT || 5500; // Use port 5500 for local development
app.listen(port, () => console.log(`Server started and running on port ${port}`));