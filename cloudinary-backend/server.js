require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

// Route for Assignments
app.get('/api/assignments', async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'raw', // Finds non-image files like docx/pdf
      prefix: 'my_uploads/assignment',
      max_results: 100,
      // 'phash: true' can sometimes help include extended metadata.
      // However, the presence of 'original_filename' primarily depends on upload parameters.
      phash: true // Keep this for broader metadata retrieval
    });
    // Cloudinary's API response for raw resources should include 'original_filename'
    // if the 'use_filename' parameter was set during upload.
    res.json(result.resources);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch assignments.' });
  }
});

// Other routes (quizzes, timetable) can remain the same
// ...

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});