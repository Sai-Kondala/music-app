const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Song = require('../models/Song');

// Use your Render MongoDB URI
const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://saikondala2004:saikondala2004@music.8w2um03.mongodb.net/?retryWrites=true&w=majority&appName=music';
const SONGS_JSON = process.argv[2] || path.join(__dirname, 'songs.json');
const AUDIO_SRC_DIR = process.argv[3] || path.join(__dirname, '../src/songs');
const UPLOADS_DIR = path.join(__dirname, '../uploads');

async function main() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const songs = JSON.parse(fs.readFileSync(SONGS_JSON, 'utf-8'));
    console.log(`📁 Found ${songs.length} songs to process`);
    
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    for (const song of songs) {
      try {
        const src = path.join(AUDIO_SRC_DIR, song.filename);
        const dest = path.join(UPLOADS_DIR, song.filename);
        
        if (!fs.existsSync(src)) {
          console.log(`❌ Audio file not found: ${src}`);
          errorCount++;
          continue;
        }
        
        // Create uploads directory structure
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(src, dest);
        
        // Check for duplicates
        const exists = await Song.findOne({ title: song.title, movie: song.movie });
        if (exists) {
          console.log(`⏭️ Skipped duplicate: ${song.title} from ${song.movie}`);
          skipCount++;
          continue;
        }
        
        // Create song in database
        await Song.create({
          title: song.title,
          movie: song.movie,
          filename: song.filename,
          uploader: null,
        });
        
        console.log(`✅ Uploaded: ${song.title} from ${song.movie}`);
        successCount++;
        
      } catch (error) {
        console.log(`❌ Error processing ${song.title}: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('\n🎉 Upload Summary:');
    console.log(`✅ Successfully uploaded: ${successCount} songs`);
    console.log(`⏭️ Skipped duplicates: ${skipCount} songs`);
    console.log(`❌ Errors: ${errorCount} songs`);
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main(); 