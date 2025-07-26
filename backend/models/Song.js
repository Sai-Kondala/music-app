const mongoose = require('mongoose');

const SongSchema = new mongoose.Schema({
  title: { type: String, required: true },
  movie: { type: String, required: true },
  filename: { type: String, required: true },
  cloudinaryUrl: { type: String }, // Store Cloudinary URL
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Song', SongSchema); 