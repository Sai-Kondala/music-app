const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Song = require('../models/Song');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dbmic5gzb',
  api_key: process.env.CLOUDINARY_API_KEY || '574539693135265',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'vyKtVrk5uXq5pWdO7ISaJ_VSGek',
});

// Cloudinary storage setup
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'music-app-audio',
    resource_type: 'auto',
    allowed_formats: ['mp3', 'wav', 'm4a', 'flac'],
  },
});

const upload = multer({ storage });

// Auth middleware
function auth(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token.' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token.' });
  }
}

// Upload song
router.post('/upload', auth, upload.single('audio'), async (req, res) => {
  try {
    const { title, movie } = req.body;
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
    
    const song = new Song({
      title,
      movie,
      filename: req.file.filename,
      cloudinaryUrl: req.file.path, // Store Cloudinary URL
      uploader: req.user.id,
    });
    await song.save();
    res.status(201).json({ message: 'Song uploaded.', song });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// List all songs
router.get('/', async (req, res) => {
  const songs = await Song.find().sort({ createdAt: -1 });
  res.json(songs);
});

// Stream song (now redirects to Cloudinary URL)
router.get('/stream/*', async (req, res) => {
  try {
    const filename = decodeURIComponent(req.params[0]);
    const song = await Song.findOne({ filename });
    
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    
    // If song has Cloudinary URL, redirect to it
    if (song.cloudinaryUrl) {
      return res.redirect(song.cloudinaryUrl);
    }
    
    // Fallback to local file if no Cloudinary URL
    const filePath = path.join(__dirname, '../uploads', filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('File not found');
    }
    
    if (filePath.endsWith('.mp3')) {
      res.setHeader('Content-Type', 'audio/mpeg');
    } else if (filePath.endsWith('.wav')) {
      res.setHeader('Content-Type', 'audio/wav');
    }
    
    res.sendFile(filePath);
  } catch (err) {
    console.error('Stream error:', err);
    res.status(500).json({ message: 'Streaming error.' });
  }
});

// Count unique audio files in songs folder
router.get('/folder-count', (req, res) => {
  const songsDir = path.join(__dirname, '../src/songs');
  function getAllFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        results = results.concat(getAllFiles(filePath));
      } else if (filePath.endsWith('.mp3') || filePath.endsWith('.wav')) {
        results.push(filePath);
      }
    });
    return results;
  }
  try {
    const files = getAllFiles(songsDir);
    res.json({ count: files.length });
  } catch (err) {
    res.status(500).json({ message: 'Error reading songs folder.' });
  }
});

module.exports = router; 