#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get the backend URL from command line argument
const backendUrl = process.argv[2];

if (!backendUrl) {
  console.log('Usage: node update-api-url.js <your-backend-url>');
  console.log('Example: node update-api-url.js https://your-app-name.onrender.com');
  process.exit(1);
}

// Remove trailing slash if present
const cleanBackendUrl = backendUrl.replace(/\/$/, '');

// Read the app.js file
const appJsPath = path.join(__dirname, 'frontend', 'app.js');
let content = fs.readFileSync(appJsPath, 'utf8');

// Update the API URL
const newApiUrl = `${cleanBackendUrl}/api`;
content = content.replace(
  /const API = .*?;/,
  `const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' \n  ? 'http://localhost:5000/api' \n  : '${newApiUrl}';`
);

// Write back to file
fs.writeFileSync(appJsPath, content);

console.log(`✅ Updated API URL to: ${newApiUrl}`);
console.log('📝 The frontend will now use:');
console.log(`   - Local: http://localhost:5000/api`);
console.log(`   - Production: ${newApiUrl}`); 