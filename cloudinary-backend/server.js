// server.js - Your unified Node.js backend server, ready for deployment on Render.

// Load environment variables from .env file
// Important: Ensure you have a .env file locally with CLOUD_NAME, API_KEY, API_SECRET.
// Crucially, DO NOT commit your .env file to Git! You will add these variables directly in Render's dashboard.
require('dotenv').config();

// Import necessary modules
const express = require('express');
const cors = require('cors'); // Middleware for Cross-Origin Resource Sharing
const cloudinary = require('cloudinary').v2; // Cloudinary SDK for interacting with your Cloudinary account

// Initialize the Express application
const app = express();

// --- Server Port Configuration ---
// Render (and most cloud hosting platforms) provides a PORT environment variable.
// Your server MUST listen on this port. The '|| 5000' is a fallback for local development.
const PORT = process.env.PORT || 5000;

// --- CORS Configuration (Cross-Origin Resource Sharing) ---
// This is critical! It allows your frontend (hosted on Netlify) to make requests to this backend (on Render),
// as they are on different domains. Without correct CORS, browsers will block these requests.
// IMPORTANT: You MUST replace 'https://your-netlify-site.netlify.app' with your ACTUAL Netlify site's live URL.
// Also, include your local development URLs for testing purposes.
const allowedOrigins = [
  'http://localhost:3000',      // Common development port for React/Vue/Angular
  'http://localhost:5173',      // Common development port for Vite
  'https://biit-bscs-ai.netlify.app/', // ✨ REPLACE THIS WITH YOUR ACTUAL NETLIFY SITE'S LIVE URL ✨
  // Example if your Netlify site URL is 'https://my-awesome-school-app.netlify.app':
  // 'https://my-awesome-school-app.netlify.app',
  // If you are using a custom domain for your Netlify frontend, add it here too:
  // 'https://www.yourcustomdomain.com',
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., from Postman, curl, or mobile apps that don't send an Origin header)
    if (!origin) return callback(null, true);
    // Check if the request's origin (the domain making the request) is in our allowed list
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      // If the origin is not allowed, return an error to prevent the request
      return callback(new Error(msg), false);
    }
    // If the origin is allowed, proceed with the request
    return callback(null, true);
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Specify which HTTP methods are allowed for cross-origin requests
  credentials: true, // Set to true if your frontend needs to send cookies or HTTP authentication credentials
  optionsSuccessStatus: 204 // Handle preflight OPTIONS requests gracefully (browser sends this before actual request)
}));

// --- Body Parsers ---
// These middleware functions parse incoming request bodies, making them accessible in req.body.
app.use(express.json()); // Parses JSON payloads (e.g., from POST requests with Content-Type: application/json)
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded payloads (e.g., from HTML forms)

// --- Cloudinary Configuration ---
// Configure the Cloudinary SDK with your API credentials.
// These credentials are pulled from environment variables, which will be set on Render.
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

// --- API Routes ---
// All your API endpoints are now unified within this single Express application.
// They will be accessible under the base URL provided by Render, followed by '/api/...'

// Route for fetching Assignments from Cloudinary
app.get('/api/assignments', async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',        // Look for uploaded files
      resource_type: 'raw',  // Specifically raw files (documents like PDF, DOCX, etc., not images/videos)
      prefix: 'my_uploads/assignment', // Cloudinary folder path to filter by
      max_results: 100,      // Maximum number of resources to return
      phash: true            // Include perceptual hash for broader metadata retrieval
    });
    res.json(result.resources); // Send the array of assignment resources as JSON response
  } catch (err) {
    console.error("❌ Error fetching assignments from Cloudinary:", err); // Log detailed error
    res.status(500).json({ error: 'Failed to fetch assignments due to a server error.' }); // Send 500 error to client
  }
});

// Route for fetching Quizzes from Cloudinary
app.get('/api/quizzes', async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'raw',
      prefix: 'my_uploads/quiz', // Cloudinary folder path for quizzes
      max_results: 100
    });
    res.json(result.resources); // Send the array of quiz resources as JSON response
  } catch (err) {
    console.error("❌ Error fetching quizzes from Cloudinary:", err);
    res.status(500).json({ error: 'Failed to fetch quizzes due to a server error.' });
  }
});

// Route for fetching Notes from Cloudinary
app.get('/api/notes', async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'raw',
      prefix: 'my_uploads/notes', // Cloudinary folder path for notes
      max_results: 100
    });
    res.json(result.resources); // Send the array of note resources as JSON response
  } catch (err) {
    console.error("❌ Error fetching notes from Cloudinary:", err);
    res.status(500).json({ error: 'Failed to fetch notes from Cloudinary due to a server error.' });
  }
});

// Route for fetching Timetable documents from Cloudinary
app.get('/api/timetable', async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'raw',
      prefix: 'my_uploads/timetable', // Cloudinary folder path for timetable
      max_results: 100
    });

    // Handle case where no timetable documents are found in the specified folder
    if (result.resources.length === 0) {
      return res.status(404).json({ error: 'No timetable documents found in the specified folder.' });
    }
    res.json(result.resources); // Send the array of timetable resources as JSON response
  } catch (err) {
    console.error("❌ Error fetching timetable from Cloudinary:", err);
    res.status(500).json({ error: 'Failed to fetch timetable due to a server error.' });
  }
});

// --- Optional: A simple root route for health checks or basic confirmation ---
// When you visit your Render backend's root URL (e.g., https://your-backend.onrender.com),
// this route will respond, confirming the server is generally running.
app.get('/', (req, res) => {
  res.send('Unified Backend Server is Running! Access API endpoints at /api/assignments, /api/quizzes, /api/notes, /api/timetable.');
});

// --- Start the Express server ---
// The server starts listening on the PORT determined by Render's environment variable,
// or defaults to 5000 for local development if the PORT variable isn't set.
app.listen(PORT, () => {
  console.log(`✅ Unified server running on port ${PORT}`);
  console.log(`Local access for testing: http://localhost:${PORT}`);
});