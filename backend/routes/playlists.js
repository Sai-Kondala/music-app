const express = require('express');
const jwt = require('jsonwebtoken');
const Playlist = require('../models/Playlist');
const Song = require('../models/Song');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

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

// Create playlist
router.post('/', auth, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Name required.' });
  const playlist = new Playlist({ name, user: req.user.id, songs: [] });
  await playlist.save();
  res.status(201).json(playlist);
});

// Get all playlists for user
router.get('/', auth, async (req, res) => {
  const playlists = await Playlist.find({ user: req.user.id }).populate('songs');
  res.json(playlists);
});

// Add song to playlist
router.post('/:id/add', auth, async (req, res) => {
  const { songId } = req.body;
  const playlist = await Playlist.findOne({ _id: req.params.id, user: req.user.id });
  if (!playlist) return res.status(404).json({ message: 'Playlist not found.' });
  if (!playlist.songs.includes(songId)) playlist.songs.push(songId);
  await playlist.save();
  res.json(playlist);
});

// Remove song from playlist
router.post('/:id/remove', auth, async (req, res) => {
  const { songId } = req.body;
  const playlist = await Playlist.findOne({ _id: req.params.id, user: req.user.id });
  if (!playlist) return res.status(404).json({ message: 'Playlist not found.' });
  playlist.songs = playlist.songs.filter(id => id.toString() !== songId);
  await playlist.save();
  res.json(playlist);
});

// Delete playlist
router.delete('/:id', auth, async (req, res) => {
  await Playlist.deleteOne({ _id: req.params.id, user: req.user.id });
  res.json({ message: 'Playlist deleted.' });
});

module.exports = router; 