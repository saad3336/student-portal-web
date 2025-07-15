// Load environment variables from .env file
require('dotenv').config();

// Import necessary modules
const express = require('express');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;

// Initialize the Express application
const app = express();

// Define the port for the notes server
// It will use the NOTES_PORT from .env, or default to 3002
const PORT = process.env.NOTES_PORT || 3005;

// Enable CORS (Cross-Origin Resource Sharing)
// This allows your frontend (notes.html) running on localhost:XXXX
// to make requests to this server running on localhost:3002
app.use(cors());

// Configure Cloudinary with your credentials
// These should be set in your .env file
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

// --- Test Route (for debugging purposes) ---
// This simple route will respond if the server is generally working.
// You can test it by visiting http://localhost:3002/ in your browser.
app.get('/', (req, res) => {
  res.send('Notes server is alive!');
});

// Main Route for Notes
// This endpoint fetches all raw files from your Cloudinary account
// that are located under the 'my_uploads/notes' folder.
app.get('/api/notes', async (req, res) => {
  try {
    // Make an API call to Cloudinary to list resources
    const result = await cloudinary.api.resources({
      type: 'upload',        // Look for uploaded files
      resource_type: 'raw',  // Specifically raw files (e.g., PDFs, documents, not images/videos)
      prefix: 'my_uploads/notes', // Filter by this folder path in Cloudinary
      max_results: 100       // Limit the number of results to 100
    });
    // Send the array of resources (files) back as a JSON response
    res.json(result.resources);
  } catch (err) {
    // Log the detailed error to the server console
    console.error("❌ Error fetching notes from Cloudinary:", err);
    // Send a 500 Internal Server Error response to the client
    res.status(500).json({ error: 'Failed to fetch notes from Cloudinary.' });
  }
});

// Start the Express server and make it listen on the defined PORT
app.listen(PORT, () => {
  console.log(`✅ Notes server running at http://localhost:${PORT}`);
});
