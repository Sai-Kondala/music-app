// Simple test script to upload a few songs manually
const fs = require('fs');
const path = require('path');

// Test with just a few songs
const testSongs = [
  {
    title: "Samajavaragamana",
    movie: "Ala Vaikuntapramlo",
    filename: "Ala Vaikuntapramlo/[iSongs.info] 01 - Samajavaragamana.mp3"
  },
  {
    title: "Inkem Inkem Inkem Kaavaale",
    movie: "Geetha Govindam", 
    filename: "Geetha Govindam/[iSongs.info] 01 - Inkem Inkem Inkem Kaavaale.mp3"
  }
];

console.log('🎵 Test Songs to Upload:');
testSongs.forEach((song, index) => {
  console.log(`${index + 1}. ${song.title} - ${song.movie}`);
});

console.log('\n📋 Instructions:');
console.log('1. Go to your app: https://music-app-1-jylc.onrender.com');
console.log('2. Login to your account');
console.log('3. Click "Add Songs" button');
console.log('4. Upload these songs manually:');
console.log('   - backend/src/songs/Ala Vaikuntapramlo/[iSongs.info] 01 - Samajavaragamana.mp3');
console.log('   - backend/src/songs/Geetha Govindam/[iSongs.info] 01 - Inkem Inkem Inkem Kaavaale.mp3');
console.log('\n🎯 This will test if your upload functionality works!'); 