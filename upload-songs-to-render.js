const fs = require('fs');
const path = require('path');

// Your Render backend URL
const RENDER_API = 'https://music-app-7dgw.onrender.com/api';
const SONGS_JSON = path.join(__dirname, 'backend/utils/songs.json');
const SONGS_SRC_DIR = path.join(__dirname, 'backend/src/songs');

async function uploadSong(songData) {
  try {
    // Read the audio file
    const audioPath = path.join(SONGS_SRC_DIR, songData.filename);
    if (!fs.existsSync(audioPath)) {
      console.log(`❌ Audio file not found: ${audioPath}`);
      return false;
    }

    const audioBuffer = fs.readFileSync(audioPath);
    
    // Create FormData-like object for Node.js
    const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substr(2);
    let body = '';
    
    // Add title
    body += `--${boundary}\r\n`;
    body += 'Content-Disposition: form-data; name="title"\r\n\r\n';
    body += songData.title + '\r\n';
    
    // Add movie
    body += `--${boundary}\r\n`;
    body += 'Content-Disposition: form-data; name="movie"\r\n\r\n';
    body += songData.movie + '\r\n';
    
    // Add audio file
    body += `--${boundary}\r\n`;
    body += 'Content-Disposition: form-data; name="audio"; filename="' + path.basename(songData.filename) + '"\r\n';
    body += 'Content-Type: audio/mpeg\r\n\r\n';
    body += audioBuffer.toString('binary') + '\r\n';
    body += `--${boundary}--\r\n`;

    // Make the request
    const response = await fetch(`${RENDER_API}/songs/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // You'll need to add your token
      },
      body: Buffer.from(body, 'binary')
    });

    if (response.ok) {
      console.log(`✅ Uploaded: ${songData.title} from ${songData.movie}`);
      return true;
    } else {
      const error = await response.text();
      console.log(`❌ Failed to upload ${songData.title}: ${error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error uploading ${songData.title}: ${error.message}`);
    return false;
  }
}

async function main() {
  try {
    // Read songs.json
    const songsData = JSON.parse(fs.readFileSync(SONGS_JSON, 'utf-8'));
    console.log(`📁 Found ${songsData.length} songs to upload`);
    
    let successCount = 0;
    let failCount = 0;
    
    // Upload each song
    for (const song of songsData) {
      const success = await uploadSong(song);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n🎉 Upload complete!`);
    console.log(`✅ Successfully uploaded: ${successCount} songs`);
    console.log(`❌ Failed to upload: ${failCount} songs`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.log('❌ This script requires Node.js 18+ for fetch support');
  console.log('💡 Alternative: Use the bulkUpload.js script locally');
  process.exit(1);
}

main(); 