const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Song = require('../models/Song');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/musicapp';
const SONGS_JSON = process.argv[2] || path.join(__dirname, 'songs.json');
const AUDIO_SRC_DIR = process.argv[3] || path.join(__dirname, 'audio');
const UPLOADS_DIR = path.join(__dirname, '../uploads');

async function main() {
  await mongoose.connect(MONGO_URI);
  const songs = JSON.parse(fs.readFileSync(SONGS_JSON, 'utf-8'));
  for (const song of songs) {
    const src = path.join(AUDIO_SRC_DIR, song.filename);
    const dest = path.join(UPLOADS_DIR, song.filename);
    if (!fs.existsSync(src)) {
      console.log(`Audio file not found: ${src}`);
      continue;
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    // Prevent duplicates
    const exists = await Song.findOne({ title: song.title, movie: song.movie });
    if (exists) {
      console.log(`Skipped duplicate: ${song.title} from ${song.movie}`);
      continue;
    }
    await Song.create({
      title: song.title,
      movie: song.movie,
      filename: song.filename,
      uploader: null,
    });
    console.log(`Uploaded: ${song.title} from ${song.movie}`);
  }
  mongoose.disconnect();
}

main(); 