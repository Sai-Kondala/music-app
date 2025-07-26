// API URL - will be replaced during build for production
// For Railway deployment, change this to: const API = 'https://your-app.up.railway.app/api';
const API = 'http://localhost:5000/api';
let token = localStorage.getItem('token') || '';
let currentUser = null;
let songs = [];
let playlists = [];
let currentSongIndex = 0;
let currentPlaylist = null;

// Auth UI
const authContainer = document.getElementById('auth-container');
const mainApp = document.getElementById('main-app');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');

showRegister.onclick = () => {
  loginForm.style.display = 'none';
  registerForm.style.display = 'block';
};
showLogin.onclick = () => {
  registerForm.style.display = 'none';
  loginForm.style.display = 'block';
};

window.addEventListener('DOMContentLoaded', () => {
  // Only query DOM elements once
  const uploadForm = document.getElementById('upload-form');
  const uploadMessage = document.getElementById('upload-message');
  const songList = document.getElementById('song-list');
  const searchBar = document.getElementById('search-bar');
  const createPlaylistForm = document.getElementById('create-playlist-form');
  const playlistName = document.getElementById('playlist-name');
  const playlistList = document.getElementById('playlist-list');
  const playlistSongs = document.getElementById('playlist-songs');
  const playBtn = document.getElementById('play-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const repeatBtn = document.getElementById('repeat-btn');
  const audioPlayer = document.getElementById('audio-player');
  const nowPlayingInfo = document.getElementById('now-playing-info');
  const progressBar = document.getElementById('progress-bar');
  const progressBarBg = document.getElementById('progress-bar-bg');
  const currentTimeSpan = document.getElementById('current-time');
  const durationSpan = document.getElementById('duration');
  const themeToggleBtn = document.getElementById('theme-toggle');
  const addSongsBtn = document.getElementById('add-songs-btn');
  const songCount = document.getElementById('song-count');

  // All event listeners and logic go here, using these variables
  // Auth UI
  if (loginBtn) {
    loginBtn.onclick = async (e) => {
      e.preventDefault();
      console.log('Login button clicked');
      loginError.textContent = '';
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      try {
        const res = await fetch(`${API}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        console.log('Login response:', data);
        if (!res.ok) throw new Error(data.message);
        token = data.token;
        localStorage.setItem('token', token);
        currentUser = data.user;
        showMainApp();
      } catch (err) {
        loginError.textContent = err.message || 'Login failed.';
        console.error('Login error:', err);
      }
    };
  }
  if (registerBtn) {
    registerBtn.onclick = async () => {
      registerError.textContent = '';
      const username = document.getElementById('register-username').value;
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;
      try {
        const res = await fetch(`${API}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
        loginError.textContent = 'Registration successful! Please login.';
      } catch (err) {
        registerError.textContent = err.message;
      }
    };
  }

  // Move logoutBtn initialization after DOM is ready
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      token = '';
      localStorage.removeItem('token');
      currentUser = null;
      showAuth();
    };
  }

  let isRepeat = false;
  let currentSongIndex = 0;
  let songs = [];
  let playlists = [];

  // All functions that use DOM elements must be inside this block:

  function playSong(index) {
    currentSongIndex = index;
    const song = songs[index];
    if (audioPlayer) audioPlayer.src = `${API}/songs/stream/${song.filename}`;
    if (nowPlayingInfo) nowPlayingInfo.textContent = `${song.title} — ${song.movie || ''}`;
    if (audioPlayer) audioPlayer.play();
    renderSongs();
  }

  function showMainApp() {
    console.log('showMainApp called');
    if (authContainer) authContainer.style.display = 'none';
    if (mainApp) mainApp.style.display = 'block';
    fetchSongs();
    fetchPlaylists();
  }

  function showAuth() {
    if (authContainer) authContainer.style.display = 'block';
    if (mainApp) mainApp.style.display = 'none';
  }

  // Fetch and display real song count from folder
  async function fetchRealSongCount() {
    try {
      const res = await fetch(`${API}/songs/folder-count`);
      const data = await res.json();
      if (songCount) songCount.textContent = `${data.count} songs`;
    } catch (err) {
      if (songCount) songCount.textContent = 'N/A';
    }
  }
  fetchRealSongCount();

  // Song Upload
  if (uploadForm) {
    uploadForm.onsubmit = async (e) => {
      e.preventDefault();
      uploadMessage.textContent = '';
      const title = document.getElementById('song-title').value;
      const movie = document.getElementById('song-movie').value;
      const file = document.getElementById('song-file').files[0];
      if (!file) return;
      // Check for duplicate title
      const checkRes = await fetch(`${API}/songs`);
      const allSongs = await checkRes.json();
      if (allSongs.some(s => s.title.trim().toLowerCase() === title.trim().toLowerCase())) {
        uploadMessage.textContent = 'This song already exists.';
        return;
      }
      const formData = new FormData();
      formData.append('title', title);
      formData.append('movie', movie);
      formData.append('audio', file);
      try {
        const res = await fetch(`${API}/songs/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        uploadMessage.textContent = 'Song uploaded!';
        fetchSongs();
        uploadForm.reset();
        fetchRealSongCount();
      } catch (err) {
        uploadMessage.textContent = err.message;
      }
    };
  }

  // Song Library
  if (searchBar) searchBar.oninput = () => renderSongs();

  // Ensure audioPlayer is present
  if (!audioPlayer) {
    console.error('Audio player element not found!');
    return;
  }

  // Play/pause toggle logic
  if (playBtn && pauseBtn) {
    playBtn.onclick = () => {
      if (audioPlayer.paused) {
        audioPlayer.play();
      }
    };
    pauseBtn.onclick = () => {
      if (!audioPlayer.paused) {
        audioPlayer.pause();
      }
    };
    audioPlayer.onplay = () => {
      playBtn.style.display = 'none';
      pauseBtn.style.display = '';
    };
    audioPlayer.onpause = () => {
      pauseBtn.style.display = 'none';
      playBtn.style.display = '';
    };
    // Set initial state
    if (audioPlayer.paused) {
      playBtn.style.display = '';
      pauseBtn.style.display = 'none';
    } else {
      playBtn.style.display = 'none';
      pauseBtn.style.display = '';
    }
  }

  // Theme toggle logic (cleaned up)
  function setTheme(mode) {
    if (mode === 'light') {
      document.body.classList.add('light-mode');
      if (themeToggleBtn) themeToggleBtn.textContent = '☀️';
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('light-mode');
      if (themeToggleBtn) themeToggleBtn.textContent = '🌙';
      localStorage.setItem('theme', 'dark');
    }
  }
  // Load theme preference on page load
  (function() {
    const savedTheme = localStorage.getItem('theme');
    setTheme(savedTheme === 'light' ? 'light' : 'dark');
  })();
  // Toggle theme on button click
  if (themeToggleBtn) {
    themeToggleBtn.onclick = () => {
      const isLight = document.body.classList.contains('light-mode');
      setTheme(isLight ? 'dark' : 'light');
    };
  }

  // Repeat button logic
  if (repeatBtn && audioPlayer) {
    repeatBtn.onclick = () => {
      isRepeat = !isRepeat;
      audioPlayer.loop = isRepeat;
      repeatBtn.style.background = isRepeat ? 'var(--accent3)' : 'var(--accent)';
      repeatBtn.style.color = isRepeat ? 'var(--bg-main)' : '#fff';
    };
  }

  // Play previous/next
  if (prevBtn) prevBtn.onclick = () => {
    if (currentSongIndex > 0) playSong(currentSongIndex - 1);
  };
  if (nextBtn) nextBtn.onclick = () => {
    if (currentSongIndex < songs.length - 1) playSong(currentSongIndex + 1);
  };
  if (audioPlayer) audioPlayer.onended = () => {
    if (isRepeat) {
      audioPlayer.currentTime = 0;
      audioPlayer.play();
    } else if (currentSongIndex < songs.length - 1) {
      playSong(currentSongIndex + 1);
    }
  };

  // Progress bar and time
  if (audioPlayer && progressBar && currentTimeSpan && durationSpan) {
    audioPlayer.ontimeupdate = () => {
      const percent = (audioPlayer.currentTime / (audioPlayer.duration || 1)) * 100;
      progressBar.style.width = percent + '%';
      currentTimeSpan.textContent = formatTime(audioPlayer.currentTime);
      durationSpan.textContent = formatTime(audioPlayer.duration);
    };
    audioPlayer.onloadedmetadata = () => {
      durationSpan.textContent = formatTime(audioPlayer.duration);
    };
  }
  if (progressBarBg && audioPlayer) {
    progressBarBg.style.cursor = 'pointer';
    progressBarBg.onclick = function(e) {
      const rect = progressBarBg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = x / rect.width;
      if (!isNaN(audioPlayer.duration)) {
        audioPlayer.currentTime = percent * audioPlayer.duration;
      }
    };
  }

  // Helper to format time
  function formatTime(sec) {
    if (isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  // Play a song by index
  // window.playSong = function(index) {
  //   currentSongIndex = index;
  //   const song = songs[index];
  //   if (audioPlayer) audioPlayer.src = `${API}/songs/stream/${song.filename}`;
  //   if (nowPlayingInfo) nowPlayingInfo.textContent = `${song.title} — ${song.movie || ''}`;
  //   if (audioPlayer) audioPlayer.play();
  //   renderSongs();
  // };

  // Patch renderSongs to allow clicking to play
  function renderSongs() {
    if (!songList) return;
    const q = searchBar ? searchBar.value.toLowerCase() : '';
    songList.innerHTML = '';
    songs.filter(s => s.title.toLowerCase().includes(q) || (s.movie && s.movie.toLowerCase().includes(q))).forEach((song, i) => {
      const li = document.createElement('li');
      li.className = 'library-song';
      // Highlight logic: match by _id or filename if in playlist mode
      let isPlaying = false;
      if (currentPlaylist && currentPlaylist.songs && currentPlaylist.songs.length > 0) {
        const playingSong = currentPlaylist.songs[currentSongIndex];
        if (playingSong && (song._id === playingSong._id || song.filename === playingSong.filename)) {
          isPlaying = true;
        }
      } else if (i === currentSongIndex) {
        isPlaying = true;
      }
      if (isPlaying) {
        li.classList.add('playing');
        li.innerHTML = `<span class='play-icon'>▶️</span> ${song.title} — ${song.movie || ''}`;
      } else {
        li.textContent = `${song.title} — ${song.movie || ''}`;
      }
      li.onclick = () => playSong(i);
      // Add to Playlist button
      const addBtn = document.createElement('button');
      addBtn.textContent = '➕';
      addBtn.title = 'Add to Playlist';
      addBtn.style.marginLeft = '12px';
      addBtn.style.background = 'var(--accent2)';
      addBtn.style.color = '#fff';
      addBtn.style.border = 'none';
      addBtn.style.borderRadius = '8px';
      addBtn.style.cursor = 'pointer';
      addBtn.style.fontSize = '1em';
      addBtn.onclick = (e) => {
        e.stopPropagation();
        showAddToPlaylistDropdown(song, addBtn);
      };
      li.appendChild(addBtn);
      songList.appendChild(li);
    });
    console.log('Rendered songs');
  }

  async function fetchSongs() {
    const res = await fetch(`${API}/songs`);
    songs = await res.json();
    console.log('Fetched songs:', songs);
    renderSongs();
  }
  fetchSongs();

  // Modal for upload
  let uploadModal = document.getElementById('upload-modal');
  if (!uploadModal) {
    uploadModal = document.createElement('div');
    uploadModal.id = 'upload-modal';
    uploadModal.style.display = 'none';
    uploadModal.style.position = 'fixed';
    uploadModal.style.top = '0';
    uploadModal.style.left = '0';
    uploadModal.style.width = '100vw';
    uploadModal.style.height = '100vh';
    uploadModal.style.background = 'rgba(0,0,0,0.4)';
    uploadModal.style.zIndex = '1000';
    uploadModal.style.justifyContent = 'center';
    uploadModal.style.alignItems = 'center';
    uploadModal.innerHTML = `
      <div style="background: var(--bg-card); padding: 32px 24px; border-radius: 16px; max-width: 480px; width: 96vw; margin: auto; position: relative;">
        <button id="close-upload-modal" style="position:absolute;top:12px;right:16px;font-size:1.3em;background:none;border:none;color:var(--accent);cursor:pointer;">&times;</button>
        <h2>Upload Song</h2>
        <form id="modal-upload-form">
          <input type="text" id="modal-song-title" class="modern-input" placeholder="Title" required style="width:100%;margin-bottom:8px;height:30px;padding:6px 10px;font-size:0.98rem;">
          <input type="text" id="modal-song-movie" class="modern-input" placeholder="Movie" required style="width:100%;margin-bottom:8px;height:30px;padding:6px 10px;font-size:0.98rem;">
          <input type="file" id="modal-song-file" accept="audio/*" required style="width:100%;margin-bottom:10px;">
          <button type="submit" style="width:100%;background:var(--accent);color:#fff;padding:10px 0;border:none;border-radius:8px;font-weight:600;">Upload</button>
        </form>
        <div id="modal-upload-message" style="margin-top:10px;"></div>
      </div>
    `;
    document.body.appendChild(uploadModal);
  }
  if (addSongsBtn) {
    addSongsBtn.onclick = () => {
      uploadModal.style.display = 'flex';
    };
  }
  document.body.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'close-upload-modal') {
      uploadModal.style.display = 'none';
    }
    if (e.target === uploadModal) {
      uploadModal.style.display = 'none';
    }
  });
  // Modal upload form logic
  const modalUploadForm = document.getElementById('modal-upload-form');
  if (modalUploadForm) {
    modalUploadForm.onsubmit = async (e) => {
      e.preventDefault();
      const title = document.getElementById('modal-song-title').value;
      const artist = document.getElementById('modal-song-movie').value;
      const file = document.getElementById('modal-song-file').files[0];
      const uploadMessage = document.getElementById('modal-upload-message');
      if (!file) return;
      const formData = new FormData();
      formData.append('title', title);
      formData.append('artist', artist);
      formData.append('audio', file);
      try {
        const res = await fetch(`${API}/songs/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        uploadMessage.textContent = 'Song uploaded!';
        fetchSongs();
        modalUploadForm.reset();
      } catch (err) {
        uploadMessage.textContent = err.message;
      }
    };
  }

  // Remove or disable the old updateSongCount logic
  // if (songCount) window.updateSongCount = function(count) {
  //   songCount.textContent = `${count} song${count === 1 ? '' : 's'}`;
  // };

  // Add to Playlist dropdown logic
  function showAddToPlaylistDropdown(song, btn) {
    // Remove any existing dropdown
    const old = document.getElementById('add-to-playlist-dropdown');
    if (old) old.remove();
    // Create dropdown
    const dropdown = document.createElement('select');
    dropdown.id = 'add-to-playlist-dropdown';
    dropdown.style.position = 'absolute';
    dropdown.style.zIndex = '1001';
    dropdown.style.left = btn.getBoundingClientRect().left + 'px';
    dropdown.style.top = btn.getBoundingClientRect().bottom + 'px';
    dropdown.style.background = '#23243a';
    dropdown.style.color = '#fff';
    dropdown.style.border = '1px solid var(--accent2)';
    dropdown.style.borderRadius = '8px';
    dropdown.style.padding = '6px 10px';
    dropdown.style.fontSize = '1em';
    dropdown.style.boxShadow = '0 2px 8px rgba(0,0,0,0.10)';
    dropdown.style.maxHeight = '200px';
    dropdown.style.overflowY = 'auto';
    dropdown.style.maxWidth = '320px';
    dropdown.style.minWidth = '180px';
    dropdown.style.marginTop = '4px';
    dropdown.style.marginBottom = '4px';
    dropdown.innerHTML = `<option disabled selected>Add to playlist...</option>`;
    playlists.forEach(pl => {
      const opt = document.createElement('option');
      opt.value = pl._id;
      opt.textContent = pl.name;
      dropdown.appendChild(opt);
    });
    document.body.appendChild(dropdown);
    dropdown.onchange = async function() {
      const playlistId = dropdown.value;
      await fetch(`${API}/playlists/${playlistId}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ songId: song._id })
      });
      dropdown.remove();
      alert('Song added to playlist!');
      fetchPlaylists();
    };
    // Remove dropdown on click elsewhere
    setTimeout(() => {
      window.addEventListener('click', function handler(e) {
        if (e.target !== dropdown) dropdown.remove();
        window.removeEventListener('click', handler);
      });
    }, 0);
  }

  // Playlists
  if (createPlaylistForm) {
    createPlaylistForm.onsubmit = async (e) => {
      e.preventDefault();
      const name = playlistName.value;
      try {
        const res = await fetch(`${API}/playlists`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name })
        });
        if (!res.ok) throw new Error('Failed to create playlist');
        playlistName.value = '';
        fetchPlaylists();
      } catch (err) {
        alert(err.message);
      }
    };
  }

  async function fetchPlaylists() {
    const res = await fetch(`${API}/playlists`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    playlists = await res.json();
    renderPlaylists();
  }

  function renderPlaylists() {
    if (!playlistList) return;
    playlistList.innerHTML = '';
    playlists.forEach((pl, i) => {
      const li = document.createElement('li');
      li.className = 'playlist-song';
      // Playlist name span (clickable)
      const nameSpan = document.createElement('span');
      nameSpan.textContent = pl.name;
      nameSpan.style.cursor = 'pointer';
      nameSpan.onclick = (e) => {
        e.stopPropagation();
        // Toggle: if this playlist is already open, close it
        if (currentPlaylist && currentPlaylist._id === pl._id && playlistSongs.innerHTML.includes(pl.name)) {
          playlistSongs.innerHTML = '';
          currentPlaylist = null;
        } else {
          showPlaylist(pl);
        }
      };
      li.appendChild(nameSpan);
      // Add play button for playlist
      const playBtn = document.createElement('button');
      playBtn.textContent = '▶️';
      playBtn.title = 'Play Playlist';
      playBtn.style.marginLeft = '12px';
      playBtn.style.background = 'var(--accent2)';
      playBtn.style.color = '#fff';
      playBtn.style.border = 'none';
      playBtn.style.borderRadius = '8px';
      playBtn.style.cursor = 'pointer';
      playBtn.style.fontSize = '1em';
      playBtn.onclick = (e) => {
        e.stopPropagation();
        if (pl.songs && pl.songs.length > 0) {
          currentPlaylist = pl;
          currentSongIndex = 0;
          playPlaylistSong(0);
        }
      };
      li.appendChild(playBtn);
      // Delete button
      const delBtn = document.createElement('button');
      delBtn.textContent = 'Delete';
      delBtn.onclick = async (e) => {
        e.stopPropagation();
        await fetch(`${API}/playlists/${pl._id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchPlaylists();
      };
      li.appendChild(delBtn);
      playlistList.appendChild(li);
    });
    console.log('Rendered playlists');
  }

  function showPlaylist(pl) {
    currentPlaylist = pl;
    playlistSongs.innerHTML = `<h3>${pl.name}</h3>`;
    if (!pl.songs.length) {
      playlistSongs.innerHTML += '<p>No songs in this playlist.</p>';
      return;
    }
    const ul = document.createElement('ul');
    pl.songs.forEach(song => {
      const li = document.createElement('li');
      li.textContent = `${song.title} — ${song.movie || ''}`;
      // Play button for song
      const playBtn = document.createElement('button');
      playBtn.textContent = 'Play';
      playBtn.onclick = () => {
        const idx = songs.findIndex(s => s._id === song._id);
        if (idx !== -1) playSong(idx);
      };
      // Remove button for song
      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Remove';
      removeBtn.onclick = async () => {
        await fetch(`${API}/playlists/${pl._id}/remove`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ songId: song._id })
        });
        fetchPlaylists();
      };
      li.appendChild(playBtn);
      li.appendChild(removeBtn);
      ul.appendChild(li);
    });
    playlistSongs.appendChild(ul);
    // Add song to playlist - REMOVED
    // const addDiv = document.createElement('div');
    // addDiv.innerHTML = '<h4>Add Song to Playlist</h4>';
    // const select = document.createElement('select');
    // songs.forEach(song => {
    //   const option = document.createElement('option');
    //   option.value = song._id;
    //   option.textContent = `${song.title} — ${song.movie || ''}`;
    //   select.appendChild(option);
    // });
    // const addBtn = document.createElement('button');
    // addBtn.textContent = 'Add';
    // addBtn.onclick = async () => {
    //   await fetch(`${pl._id}/add`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    //     body: JSON.stringify({ songId: select.value })
    //   });
    //   fetchPlaylists();
    // };
    // addDiv.appendChild(select);
    // addDiv.appendChild(addBtn);
    // playlistSongs.appendChild(addDiv);
  }
  // Play a song from the current playlist
  function playPlaylistSong(idx) {
    if (!currentPlaylist || !currentPlaylist.songs || currentPlaylist.songs.length === 0) return;
    const song = currentPlaylist.songs[idx];
    currentSongIndex = idx;
    if (audioPlayer) audioPlayer.src = `${API}/songs/stream/${song.filename}`;
    if (nowPlayingInfo) nowPlayingInfo.textContent = `${song.title} — ${song.movie || ''}`;
    if (audioPlayer) audioPlayer.play();
    renderSongs();
  }
  // Override next/prev for playlist
  if (nextBtn) nextBtn.onclick = () => {
    if (currentPlaylist && currentPlaylist.songs && currentSongIndex < currentPlaylist.songs.length - 1) {
      playPlaylistSong(currentSongIndex + 1);
    } else if (!currentPlaylist && currentSongIndex < songs.length - 1) {
      playSong(currentSongIndex + 1);
    }
  };
  if (prevBtn) prevBtn.onclick = () => {
    if (currentPlaylist && currentPlaylist.songs && currentSongIndex > 0) {
      playPlaylistSong(currentSongIndex - 1);
    } else if (!currentPlaylist && currentSongIndex > 0) {
      playSong(currentSongIndex - 1);
    }
  };

  // Add a global error message for auth issues
  const globalAuthError = document.createElement('div');
  globalAuthError.id = 'global-auth-error';
  globalAuthError.style.color = '#ff4d4f';
  globalAuthError.style.textAlign = 'center';
  globalAuthError.style.margin = '12px 0';
  const loginFormParent = document.getElementById('auth-container');
  if (loginFormParent) loginFormParent.prepend(globalAuthError);

  // On load, show main app if authenticated
  if (token) {
    fetchPlaylists().then(showMainApp).catch(showAuth);
  } else {
    showAuth();
  }
}); 