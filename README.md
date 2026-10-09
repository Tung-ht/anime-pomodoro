# 🌙 Starlight Anime Pomodoro - Night Edition

A local Pomodoro timer website designed for personal deep work and study, featuring a **dreamy 2D/3D anime night scenery animation** (inspired by Makoto Shinkai & Studio Ghibli aesthetics), an integrated **smart YouTube music random player**, and an offline **nocturnal ambient sound synthesizer (Wind, Crickets, Rain, Fireplace)**.

---

## ✨ Key Features

### 1. 🌌 Dreamy Anime Night Sky Engine (Canvas 2D/3D Physics)
- **Deep Cosmic Palette & Drifting Nebulae:** Shinkai-style gradient transitioning from deep space void (`#030511`) down to midnight indigo and soft horizon teal, accompanied by drifting starlight nebulae.
- **The Ethereal Moon:** Crisp golden crescent moon (or full/lavender celestial moon) surrounded by soft glowing halos with translucent clouds drifting across its face.
- **Meteor Shower / Shooting Stars:** Radiant shooting stars streaking across the night sky with luminous particle trails.
- **Interactive Stargazing:** Click anywhere on the sky or press the `Space` bar to instantly wish upon a shooting star!
- **Night Breeze & Fireflies:** Gentle breeze streamlines swooshing across the screen; emerald and golden fireflies hovering over the grass.
- **Swaying Grass & Cozy Anime Silhouette:** Physical sine-wave grass blades swaying with wind gusts on the cliff, with an anime character, cozy cat, and warm glowing lantern.

### 2. 🍅 Full-Featured Pomodoro Focus Engine
- **3 Focus Modes:** Focus (25 min default), Short Break (5 min), and Long Break (15 min after every 4 cycles), all fully customizable.
- **Accurate Delta-Time Counter:** Uses `Date.now()` delta calculation to guarantee zero time drift even when running in background tabs.
- **Breathing SVG Progress Ring:** Smooth circular progress ring with neon gradient glow.
- **Live Tab Title Synchronization:** Browser tab updates dynamically (e.g. `(24:59) 🌙 Focus | Starlight Pomodoro`).
- **Tibetan Singing Bowl Chime:** Meditative Solfeggio bell chords synthesized via Web Audio API upon session completion.
- **Study Goals / Task Tracker:** Add your daily learning objectives, track completed tomato badges (🍅) per task.
- **Daily Statistics:** Automatically tracks completed sessions and total study minutes in `localStorage`.

### 3. 🎵 Personal YouTube Music Player with Random Shuffle
- **Custom YouTube URLs:** Paste any YouTube video or study stream link (`youtube.com/watch?v=...`, `youtu.be/...`).
- **Persistent Storage:** Your playlist is automatically saved in `localStorage` and never lost upon closing the browser.
- **Smart Fisher-Yates Random Shuffle:** Plays through your playlist in randomized order without repeating the same track consecutively.
- **Auto-Advance:** Automatically advances to the next random track when the current video ends.
- **Mini Video Screen:** Includes a toggleable pop-up monitor in the bottom dock to watch cozy anime study visuals.
- **Pre-Loaded Study Streams:** Comes pre-loaded with verified, permanent high-quality Lofi & ambient study soundtracks.

### 4. 🍃 Nocturnal Ambient Sound Mixer (Web Audio API)
- 100% offline, synthesized directly in browser (no external MP3 downloads required):
  - **Night Breeze (Wind)**
  - **Summer Crickets (Nocturnal chirping bursts)**
  - **Gentle Night Rain (Soothing rainfall)**
  - **Hearth Fireplace (Warm crackle)**
- Independent volume sliders to layer natural soundscapes over your YouTube music.

### 5. 🧘 Zen / Fullscreen Mode
- Press the `Z` key to hide all control panels, leaving only the tranquil starry sky, the glowing moon, breeze particles, meteors, and a minimalist breathing starlight countdown.

---

## 🚀 How to Run Locally

### Method 1: One-Click Launch (Recommended for Windows)
1. Open the folder `c:\zlearn\pomodoro-anime`.
2. Double-click **`start.bat`**.
3. The server starts instantly and opens your default browser at `http://localhost:3000`.

### Method 2: Python Command
```powershell
python c:\zlearn\pomodoro-anime\server.py
```

### Method 3: Node.js Command
```powershell
node c:\zlearn\pomodoro-anime\server.js
# or
npm start
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| **`Space`** | Wish upon a shooting star across the sky ✨ |
| **`Enter`** | Start or Pause the Pomodoro timer |
| **`Z`** | Toggle Zen Mode (Scenic immersion view) |
| **`Esc`** | Close open modals or exit Zen Mode |
| **Click on Sky** | Cast a shooting star aimed towards cursor |

---

## 📁 Project Architecture

```
c:\zlearn\pomodoro-anime\
├── index.html            # Main HTML structure & modals
├── css\
│   └── style.css         # Glassmorphism, night theme, responsive styles
├── js\
│   ├── canvas-scenery.js # 2D/3D anime canvas engine (sky, moon, meteors, wind)
│   ├── ambient-audio.js  # Web Audio API synthesizers (wind, crickets, rain, fire)
│   ├── youtube-player.js # YouTube API, URL parser, Fisher-Yates shuffle queue
│   ├── pomodoro.js       # Pomodoro timer engine, task manager, daily stats
│   └── app.js            # Main application coordinator & shortcuts
├── server.py             # Python HTTP server launcher
├── server.js             # Node.js HTTP server launcher
├── start.bat             # 1-click Windows runner
└── README.md             # Documentation
```
