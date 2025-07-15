require('dotenv').config(); // Load environment variables from .env file
const express = require('express'); // Import the Express.js framework
const cors = require('cors'); // Import CORS middleware for cross-origin requests
const cloudinary = require('cloudinary').v2; // Import Cloudinary SDK

const app = express(); // Create an Express application instance
const PORT = process.env.TIMETABLE_PORT || 3002; // Define the port, defaulting to 3002

// Enable CORS for all routes, allowing requests from different origins
app.use(cors());

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

// Define an API route to fetch timetable documents
app.get('/api/timetable', async (req, res) => {
    try {
        // Fetch resources from Cloudinary
        const result = await cloudinary.api.resources({
            type: 'upload',        // Specify that we are looking for uploaded resources
            resource_type: 'raw',  // Fetch raw files (documents like .docx, .pdf)
            prefix: 'my_uploads/timetable', // Specify the folder prefix
            max_results: 100       // ✨ IMPORTANT FIX: Increased max_results to fetch multiple documents
        });
        
        // If no documents are found, send a 404 Not Found response
        if (result.resources.length === 0) {
            return res.status(404).json({ error: 'No timetable documents found in the specified folder.' });
        }

        // Send the array of found resources as JSON
        res.json(result.resources); // Sending the entire array now
    } catch (err) {
        console.error("Error fetching timetable from Cloudinary:", err);
        res.status(500).json({ error: 'Failed to fetch timetable due to a server error.' });
    }
});

// Start the Express server and listen on the defined port
app.listen(PORT, () => {
    console.log(`✅ Timetable server running at http://localhost:${PORT}`);
});
