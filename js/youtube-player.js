/**
 * ============================================================================
 * YOUTUBE MUSIC PLAYER & RANDOM PLAYLIST MANAGER
 * English Edition & High Reliability
 * Features:
 *   - User-defined YouTube video/stream URLs
 *   - LocalStorage auto-persistence
 *   - Smart Fisher-Yates Random Shuffle (no immediate repeat)
 *   - Auto-advance on track finish
 *   - Tested embeddable default study playlist
 *   - Toggleable Video Preview
 *   - Robust error handling (prevents recursion loops)
 * ============================================================================
 */

class YouTubeMusicPlayer {
  constructor() {
    this.storageKey = 'anime_pomodoro_yt_playlist_v3';
    this.storageSettingsKey = 'anime_pomodoro_yt_settings_v3';

    // Verified permanent embeddable high-quality lofi / ambient study streams
    this.defaultPlaylist = [
      {
        id: 'lTRiuFIWV54',
        title: '1 A.M Study Session 📚 [Lofi Hip Hop]',
        url: 'https://www.youtube.com/watch?v=lTRiuFIWV54'
      },
      {
        id: 'TURbeWK2wwg',
        title: '4 A.M Study Session 🌙 [Late Night Lofi Beats]',
        url: 'https://www.youtube.com/watch?v=TURbeWK2wwg'
      },
      {
        id: 'WPni755-Krg',
        title: 'Alpha Waves 🧠 Deep Focus & Study Concentration',
        url: 'https://www.youtube.com/watch?v=WPni755-Krg'
      },
      {
        id: '2OEL4P1Rz04',
        title: 'The Hidden Valley 🌿 Ambient Relaxing Study Music',
        url: 'https://www.youtube.com/watch?v=2OEL4P1Rz04'
      },
      {
        id: 'CHFif_y2TyM',
        title: 'Royal Library 🕯️ Rain & Fireplace Study Ambience',
        url: 'https://www.youtube.com/watch?v=CHFif_y2TyM'
      }
    ];

    // State
    this.playlist = this.loadPlaylist();
    this.currentIndex = 0;
    this.isPlaying = false;
    this.isShuffle = true; // Random shuffle by default per user request
    this.volume = 75;
    this.isMuted = false;
    this.consecutiveErrors = 0;

    // Shuffle queue
    this.shuffleQueue = [];

    // YouTube API instance
    this.player = null;
    this.isApiReady = false;

    this.init();
  }

  // ==========================================================================
  // INITIALIZATION & API LOADING
  // ==========================================================================

  init() {
    this.loadSettings();
    this.buildShuffleQueue();
    this.bindEvents();
    this.renderPlaylistUI();
    this.updateTrackDisplay();

    // Dynamically inject YouTube IFrame API
    if (!window.YT || !window.YT.Player) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        this.onApiReady();
      };
    } else {
      this.onApiReady();
    }
  }

  onApiReady() {
    this.isApiReady = true;
    const initialTrack = this.getCurrentTrack();
    const initialVideoId = initialTrack ? initialTrack.id : 'lTRiuFIWV54';

    try {
      this.player = new YT.Player('youtube-iframe-target', {
        height: '180',
        width: '320',
        videoId: initialVideoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          enablejsapi: 1,
          playsinline: 1
        },
        events: {
          onReady: (event) => this.onPlayerReady(event),
          onStateChange: (event) => this.onPlayerStateChange(event),
          onError: (event) => this.onPlayerError(event)
        }
      });
    } catch (err) {
      console.warn('Error instantiating YT.Player:', err);
    }
  }

  onPlayerReady(event) {
    if (this.player && typeof this.player.setVolume === 'function') {
      this.player.setVolume(this.volume);
    }
    const badge = document.getElementById('music-status-badge');
    if (badge) badge.textContent = 'Ready';
  }

  onPlayerStateChange(event) {
    // YT.PlayerState: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
    if (event.data === YT.PlayerState.PLAYING) {
      this.consecutiveErrors = 0;
      this.setPlayingState(true);

      // Attempt to retrieve actual title from YouTube metadata
      try {
        const videoData = this.player.getVideoData();
        if (videoData && videoData.title && this.getCurrentTrack()) {
          if (!this.getCurrentTrack().customTitle) {
            this.getCurrentTrack().title = videoData.title;
            this.savePlaylist();
            this.updateTrackDisplay();
          }
        }
      } catch (e) {}
    } else if (event.data === YT.PlayerState.PAUSED) {
      this.setPlayingState(false);
    } else if (event.data === YT.PlayerState.ENDED) {
      // Auto-advance to next random track
      this.playNext();
    }
  }

  onPlayerError(event) {
    console.warn('YouTube Player error code:', event.data);
    this.consecutiveErrors++;

    const badge = document.getElementById('music-status-badge');
    if (badge) badge.textContent = 'Error: Skipping';

    // Prevent infinite recursion loops
    if (this.consecutiveErrors >= 4) {
      console.warn('Multiple playback errors encountered, pausing auto-skip.');
      this.setPlayingState(false);
      if (badge) badge.textContent = 'Embed Blocked';
      return;
    }

    // Try skipping to next track after 1.5s
    setTimeout(() => {
      this.playNext();
    }, 1500);
  }

  // ==========================================================================
  // PLAYBACK CONTROLS
  // ==========================================================================

  play() {
    if (!this.player || typeof this.player.playVideo !== 'function') {
      const badge = document.getElementById('music-status-badge');
      if (badge) badge.textContent = 'Loading API...';
      return;
    }
    try {
      this.player.playVideo();
      this.setPlayingState(true);
    } catch (e) {
      console.warn('Play error:', e);
    }
  }

  pause() {
    if (!this.player || typeof this.player.pauseVideo !== 'function') return;
    try {
      this.player.pauseVideo();
      this.setPlayingState(false);
    } catch (e) {}
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  playTrackAtIndex(index) {
    if (index < 0 || index >= this.playlist.length) return;
    this.currentIndex = index;
    const track = this.playlist[this.currentIndex];
    this.loadVideoById(track.id);
    this.updateTrackDisplay();
    this.renderPlaylistUI();
  }

  playNext() {
    if (this.playlist.length === 0) return;

    if (this.isShuffle) {
      if (this.shuffleQueue.length === 0) {
        this.buildShuffleQueue();
      }
      this.currentIndex = this.shuffleQueue.pop();
    } else {
      this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    }

    const track = this.playlist[this.currentIndex];
    this.loadVideoById(track.id);
    this.updateTrackDisplay();
    this.renderPlaylistUI();
  }

  playPrev() {
    if (this.playlist.length === 0) return;
    this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    const track = this.playlist[this.currentIndex];
    this.loadVideoById(track.id);
    this.updateTrackDisplay();
    this.renderPlaylistUI();
  }

  loadVideoById(videoId) {
    if (!this.player || typeof this.player.loadVideoById !== 'function') return;
    try {
      this.player.loadVideoById(videoId);
      this.setPlayingState(true);
    } catch (e) {}
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(100, vol));
    if (this.player && typeof this.player.setVolume === 'function') {
      this.player.setVolume(this.volume);
    }
    this.saveSettings();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.player) {
      if (this.isMuted) {
        this.player.mute();
      } else {
        this.player.unMute();
      }
    }
    this.updateVolumeIcon();
  }

  toggleShuffle() {
    this.isShuffle = !this.isShuffle;
    const btn = document.getElementById('btn-shuffle-toggle');
    if (btn) {
      btn.classList.toggle('active', this.isShuffle);
    }
    if (this.isShuffle) {
      this.buildShuffleQueue();
    }
    this.saveSettings();
  }

  buildShuffleQueue() {
    const indices = this.playlist.map((_, i) => i).filter(i => i !== this.currentIndex);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    this.shuffleQueue = indices;
  }

  setPlayingState(playing) {
    this.isPlaying = playing;
    const vinyl = document.getElementById('vinyl-disc');
    const playIcon = document.getElementById('music-play-icon');
    const badge = document.getElementById('music-status-badge');

    if (vinyl) {
      vinyl.classList.toggle('playing', playing);
    }

    if (playIcon) {
      playIcon.setAttribute('data-lucide', playing ? 'pause' : 'play');
      if (window.lucide) window.lucide.createIcons();
    }

    if (badge) {
      badge.textContent = playing ? 'Playing' : 'Paused';
    }
  }

  // ==========================================================================
  // PLAYLIST MANAGEMENT
  // ==========================================================================

  extractVideoId(input) {
    if (!input) return null;
    input = input.trim();

    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
      return input;
    }

    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = input.match(regex);
    return match ? match[1] : null;
  }

  addVideo(url, title = '') {
    const videoId = this.extractVideoId(url);
    if (!videoId) {
      alert('Invalid YouTube URL! Please enter a valid YouTube link (e.g. https://www.youtube.com/watch?v=...)');
      return false;
    }

    const existing = this.playlist.find(item => item.id === videoId);
    if (existing) {
      alert('This video is already in your playlist!');
      return false;
    }

    const newTrack = {
      id: videoId,
      title: title.trim() || `YouTube Track (${videoId})`,
      customTitle: !!title.trim(),
      url: url.trim()
    };

    this.playlist.push(newTrack);
    this.savePlaylist();
    this.buildShuffleQueue();
    this.renderPlaylistUI();
    this.updateTrackDisplay();

    if (this.playlist.length === 1) {
      this.playTrackAtIndex(0);
    }

    return true;
  }

  removeVideo(index) {
    if (index < 0 || index >= this.playlist.length) return;
    
    const wasPlayingCurrent = (index === this.currentIndex);
    this.playlist.splice(index, 1);
    this.savePlaylist();
    this.buildShuffleQueue();

    if (this.playlist.length === 0) {
      this.currentIndex = 0;
      this.pause();
      this.updateTrackDisplay();
    } else if (wasPlayingCurrent) {
      this.currentIndex = this.currentIndex % this.playlist.length;
      this.playTrackAtIndex(this.currentIndex);
    } else if (index < this.currentIndex) {
      this.currentIndex--;
    }

    this.renderPlaylistUI();
    this.updateTrackDisplay();
  }

  resetToDefaultPlaylist() {
    if (confirm('Restore default study playlist (Lofi Hip Hop & Ambient)?')) {
      this.playlist = JSON.parse(JSON.stringify(this.defaultPlaylist));
      this.currentIndex = 0;
      this.savePlaylist();
      this.buildShuffleQueue();
      this.renderPlaylistUI();
      this.playTrackAtIndex(0);
    }
  }

  clearPlaylist() {
    if (confirm('Are you sure you want to clear your entire playlist?')) {
      this.playlist = [];
      this.currentIndex = 0;
      this.savePlaylist();
      this.pause();
      this.renderPlaylistUI();
      this.updateTrackDisplay();
    }
  }

  // ==========================================================================
  // UI & EVENTS
  // ==========================================================================

  getCurrentTrack() {
    return this.playlist[this.currentIndex] || null;
  }

  updateTrackDisplay() {
    const track = this.getCurrentTrack();
    const titleEl = document.getElementById('track-title');
    const countEl = document.getElementById('music-count');

    if (titleEl) {
      titleEl.textContent = track ? track.title : 'No tracks in playlist';
      titleEl.title = track ? track.title : '';
    }

    if (countEl) {
      countEl.textContent = this.playlist.length > 0 
        ? `${this.currentIndex + 1}/${this.playlist.length}` 
        : '0/0';
    }
  }

  renderPlaylistUI() {
    const container = document.getElementById('playlist-items-container');
    const lengthEl = document.getElementById('playlist-length');
    if (!container) return;

    if (lengthEl) lengthEl.textContent = this.playlist.length;

    if (this.playlist.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; color: var(--text-dim); padding: 24px;">
          Playlist is empty. Paste a YouTube link above to add study music!
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    this.playlist.forEach((item, index) => {
      const isActive = (index === this.currentIndex);
      const div = document.createElement('div');
      div.className = `playlist-item ${isActive ? 'active' : ''}`;

      div.innerHTML = `
        <div class="item-left" data-index="${index}">
          <span class="item-index">${index + 1}</span>
          ${isActive ? '<i data-lucide="music" class="item-playing-icon"></i>' : ''}
          <span class="item-title">${this.escapeHtml(item.title)}</span>
        </div>
        <button class="item-del-btn" data-del="${index}" title="Remove track">
          <i data-lucide="trash-2"></i>
        </button>
      `;

      div.querySelector('.item-left').addEventListener('click', () => {
        this.playTrackAtIndex(index);
      });

      div.querySelector('.item-del-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeVideo(index);
      });

      container.appendChild(div);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  bindEvents() {
    const btnPlay = document.getElementById('btn-play-music');
    if (btnPlay) btnPlay.addEventListener('click', () => this.togglePlay());

    const btnNext = document.getElementById('btn-next-track');
    if (btnNext) btnNext.addEventListener('click', () => this.playNext());

    const btnPrev = document.getElementById('btn-prev-track');
    if (btnPrev) btnPrev.addEventListener('click', () => this.playPrev());

    const btnShuffle = document.getElementById('btn-shuffle-toggle');
    if (btnShuffle) {
      btnShuffle.classList.toggle('active', this.isShuffle);
      btnShuffle.addEventListener('click', () => this.toggleShuffle());
    }

    const volSlider = document.getElementById('volume-slider');
    if (volSlider) {
      volSlider.value = this.volume;
      volSlider.addEventListener('input', (e) => this.setVolume(Number(e.target.value)));
    }

    const btnMute = document.getElementById('btn-mute-music');
    if (btnMute) btnMute.addEventListener('click', () => this.toggleMute());

    // Toggle Video Preview Pill
    const btnToggleVideo = document.getElementById('btn-toggle-video');
    const videoContainer = document.getElementById('yt-player-container');
    if (btnToggleVideo && videoContainer) {
      btnToggleVideo.addEventListener('click', () => {
        const isVisible = videoContainer.classList.toggle('visible');
        btnToggleVideo.classList.toggle('active', isVisible);
      });
    }

    const formAdd = document.getElementById('form-add-video');
    if (formAdd) {
      formAdd.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputUrl = document.getElementById('input-yt-url');
        const inputTitle = document.getElementById('input-yt-title');
        if (inputUrl && inputUrl.value) {
          const success = this.addVideo(inputUrl.value, inputTitle ? inputTitle.value : '');
          if (success) {
            inputUrl.value = '';
            if (inputTitle) inputTitle.value = '';
          }
        }
      });
    }

    const btnReset = document.getElementById('btn-reset-default-playlist');
    if (btnReset) btnReset.addEventListener('click', () => this.resetToDefaultPlaylist());

    const btnClear = document.getElementById('btn-clear-playlist');
    if (btnClear) btnClear.addEventListener('click', () => this.clearPlaylist());
  }

  updateVolumeIcon() {
    const icon = document.getElementById('volume-icon');
    if (!icon) return;
    if (this.isMuted || this.volume === 0) {
      icon.setAttribute('data-lucide', 'volume-x');
    } else if (this.volume < 50) {
      icon.setAttribute('data-lucide', 'volume-1');
    } else {
      icon.setAttribute('data-lucide', 'volume-2');
    }
    if (window.lucide) window.lucide.createIcons();
  }

  // ==========================================================================
  // STORAGE
  // ==========================================================================

  loadPlaylist() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    return JSON.parse(JSON.stringify(this.defaultPlaylist));
  }

  savePlaylist() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.playlist));
    } catch (e) {}
  }

  loadSettings() {
    try {
      const data = localStorage.getItem(this.storageSettingsKey);
      if (data) {
        const parsed = JSON.parse(data);
        if (typeof parsed.volume === 'number') this.volume = parsed.volume;
        if (typeof parsed.isShuffle === 'boolean') this.isShuffle = parsed.isShuffle;
      }
    } catch (e) {}
  }

  saveSettings() {
    try {
      localStorage.setItem(this.storageSettingsKey, JSON.stringify({
        volume: this.volume,
        isShuffle: this.isShuffle
      }));
    } catch (e) {}
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

// Global instance exposed
window.ytMusicPlayer = new YouTubeMusicPlayer();
