require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;

const app = express();
const PORT = process.env.QUIZ_PORT || 3001; 

app.use(cors());

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

// Route for Quizzes
app.get('/api/quizzes', async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'raw',
      // --- ✨ THIS IS THE FIX ---
      prefix: 'my_uploads/quiz', // Corrected to match your full path
      max_results: 100
    });
    res.json(result.resources);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch quizzes.' });
  }
});
app.listen(PORT, () => {
  console.log(`✅ Quiz server running at http://localhost:${PORT}`);
});