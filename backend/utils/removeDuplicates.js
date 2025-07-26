const mongoose = require('mongoose');
const Song = require('../models/Song');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/musicapp';

async function removeDuplicates() {
  await mongoose.connect(MONGO_URI);
  const all = await Song.find();
  const seen = new Set();
  let removed = 0;
  for (const song of all) {
    const key = (song.title + '|' + song.movie).toLowerCase();
    if (seen.has(key)) {
      await Song.deleteOne({ _id: song._id });
      removed++;
    } else {
      seen.add(key);
    }
  }
  console.log(`Removed ${removed} duplicate songs.`);
  mongoose.disconnect();
}

removeDuplicates(); 