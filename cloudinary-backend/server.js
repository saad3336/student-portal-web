// server.js - This will be your unified backend server for Render

// Load environment variables from .env file
// Make sure you have a .env file locally with CLOUD_NAME, API_KEY, API_SECRET
// Do NOT commit your .env file to Git!
require('dotenv').config();

// Import necessary modules
const express = require('express');
const cors = require('cors');
const cloudinary = require('cloudinary').v2; // Cloudinary SDK for interacting with your Cloudinary account

// Initialize the Express application
const app = express();

// --- Server Port Configuration ---
// Render (and most hosting platforms) provides the PORT environment variable.
// Your server MUST listen on this port. The '|| 5000' is a fallback for local development.
const PORT = process.env.PORT || 5000;

// --- CORS Configuration (Cross-Origin Resource Sharing) ---
// This is critical for allowing your Netlify frontend (on a different domain) to make requests to this backend.
// IMPORTANT: Replace 'https://your-netlify-site.netlify.app' with your ACTUAL Netlify site URL.
// Also, include your local development URLs for testing.
const allowedOrigins = [
  'http://localhost:3000',      // Common port for React/Vue/Angular dev servers
  'http://localhost:5173',      // Common port for Vite dev servers
  'https://your-netlify-site.netlify.app', // ✨ YOUR LIVE NETLIFY FRONTEND URL HERE ✨
  // If you have a custom domain for your Netlify frontend, add it here too:
  // 'https://www.yourcustomdomain.com',
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., from Postman, curl, or mobile apps)
    if (!origin) return callback(null, true);
    // Check if the request's origin is in our allowed list
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Specify allowed HTTP methods
  credentials: true, // Allow cookies to be sent with requests (if you use sessions/cookies)
  optionsSuccessStatus: 204 // Handle preflight OPTIONS requests gracefully
}));

// --- Body Parsers ---
// These middleware functions parse incoming request bodies.
// `express.json()` for JSON payloads (e.g., from POST requests).
// `express.urlencoded()` for URL-encoded payloads (e.g., from HTML forms).
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Cloudinary Configuration ---
// Configure Cloudinary SDK with your credentials. These are pulled from environment variables.
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

// --- API Routes ---
// All your API endpoints are now integrated into this single Express app.
// They will be accessible under the base URL provided by Render, followed by '/api/...'

// Route for fetching Assignments
app.get('/api/assignments', async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'raw', // Fetch non-image files (PDFs, DOCX, etc.)
      prefix: 'my_uploads/assignment', // Cloudinary folder path for assignments
      max_results: 100, // Maximum number of results to return
      phash: true // Include perceptual hash for broader metadata (if applicable)
    });
    res.json(result.resources); // Send the array of assignment resources as JSON
  } catch (err) {
    console.error("❌ Error fetching assignments from Cloudinary:", err);
    res.status(500).json({ error: 'Failed to fetch assignments due to a server error.' });
  }
});

// Route for fetching Quizzes
app.get('/api/quizzes', async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'raw',
      prefix: 'my_uploads/quiz', // Cloudinary folder path for quizzes
      max_results: 100
    });
    res.json(result.resources); // Send the array of quiz resources as JSON
  } catch (err) {
    console.error("❌ Error fetching quizzes from Cloudinary:", err);
    res.status(500).json({ error: 'Failed to fetch quizzes due to a server error.' });
  }
});

// Route for fetching Notes
app.get('/api/notes', async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'raw',
      prefix: 'my_uploads/notes', // Cloudinary folder path for notes
      max_results: 100
    });
    res.json(result.resources); // Send the array of note resources as JSON
  } catch (err) {
    console.error("❌ Error fetching notes from Cloudinary:", err);
    res.status(500).json({ error: 'Failed to fetch notes due to a server error.' });
  }
});

// Route for fetching Timetable documents
app.get('/api/timetable', async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'raw',
      prefix: 'my_uploads/timetable', // Cloudinary folder path for timetable
      max_results: 100
    });

    // Handle case where no timetable documents are found
    if (result.resources.length === 0) {
      return res.status(404).json({ error: 'No timetable documents found in the specified folder.' });
    }
    res.json(result.resources); // Send the array of timetable resources as JSON
  } catch (err) {
    console.error("❌ Error fetching timetable from Cloudinary:", err);
    res.status(500).json({ error: 'Failed to fetch timetable due to a server error.' });
  }
});

// --- Optional: A simple root route to confirm server is running ---
// This can be useful for health checks or just to see a basic message
// when you visit your backend's root URL in a browser.
app.get('/', (req, res) => {
  res.send('Unified Backend Server is Running! Access API endpoints at /api/assignments, /api/quizzes, /api/notes, /api/timetable.');
});

// --- Start the Express server ---
// The server listens on the PORT determined by Render or the fallback 5000.
app.listen(PORT, () => {
  console.log(`✅ Unified server running on port ${PORT}`);
  console.log(`Local access for testing: http://localhost:${PORT}`);
});