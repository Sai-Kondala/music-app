# Music Web App

A full-featured music player web application with user authentication, song upload (single and bulk), playlists, and a modern responsive UI.

## Features
- User registration and login
- Upload songs (single and bulk)
- Song library with search
- Audio player (play, pause, next, previous, seek)
- Playlist management (create, edit, delete, add/remove songs)
- Responsive, modern UI

## Project Structure
- `/backend` — Node.js/Express/MongoDB backend
- `/frontend` — HTML/CSS/JS frontend

## Setup Instructions

*Instructions will be added after code generation is complete.* 

Your full-stack music web app is now scaffolded and ready!  
Here’s what you have:

---

## **Backend**
- Node.js + Express server (`backend/server.js`)
- MongoDB models for User, Song, Playlist
- Auth, song, and playlist API routes
- Local file storage for audio files (`backend/uploads`)
- Bulk upload script (`backend/utils/bulkUpload.js`) and sample metadata (`backend/utils/songs.json`)

## **Frontend**
- Modern, responsive UI (`frontend/index.html`, `frontend/style.css`)
- All main features: login/register, song upload, song library, audio player, playlist management
- JavaScript for all app logic (`frontend/app.js`)

---

## **What You Need To Do Next**

### 1. **Install Backend Dependencies**
Open a terminal in the `backend` folder and run:
```sh
npm install
```

### 2. **Set Up MongoDB**
- Make sure MongoDB is running locally (default: `mongodb://localhost:27017/musicapp`).
- If you want to use a different URI, set the `MONGO_URI` environment variable.

### 3. **Set Up JWT Secret (Optional)**
- You can set a `JWT_SECRET` environment variable for better security.

### 4. **Start the Backend Server**
```sh
node server.js
```
or
```sh
npm start
```

### 5. **Bulk Upload Songs (Optional)**
- Place your MP3 files in a folder (e.g., `backend/utils/audio/`).
- Edit `backend/utils/songs.json` to match your files.
- Run:
  ```sh
  node utils/bulkUpload.js utils/songs.json utils/audio
  ```
- This will copy files to `backend/uploads` and add them to MongoDB.

### 6. **Open the Frontend**
- Open `frontend/index.html` in your browser.
- The app will connect to the backend at `http://localhost:5000/api`.

---

## **How to Add Many Songs at Once**
1. Place all your MP3 files in a folder (e.g., `backend/utils/audio/`).
2. Create or edit `backend/utils/songs.json` with entries like:
   ```json
   [
     { "title": "Song Title", "artist": "Artist Name", "filename": "yourfile.mp3" }
   ]
   ```
3. Run the bulk upload script as shown above.

---

## **You’re Ready!**
- Register a user, upload songs, create playlists, and enjoy your music player.
- You can further customize the UI, add features, or deploy online.

**Let me know if you need help with any step, want to add more features, or need deployment instructions!** 