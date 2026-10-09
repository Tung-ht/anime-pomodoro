/**
 * ============================================================================
 * MAIN APPLICATION ORCHESTRATOR
 * Coordinates:
 *   - Anime Scenery Canvas Engine
 *   - YouTube Random Music Player
 *   - Pomodoro Timer Engine
 *   - Ambient Sound Synthesizer Mixer
 *   - Modals & Global Keyboard Shortcuts
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 1. Initialize Anime Canvas Scenery
  const scenery = new AnimeScenery('anime-canvas');
  window.animeScenery = scenery;

  // 2. Modals Control (Open & Close)
  const modals = {
    playlist: document.getElementById('modal-playlist'),
    settings: document.getElementById('modal-settings'),
    tasks: document.getElementById('modal-tasks'),
    ambient: document.getElementById('modal-ambient')
  };

  function openModal(modalId) {
    if (modals[modalId]) {
      modals[modalId].classList.add('open');
      if (window.lucide) window.lucide.createIcons();
    }
  }

  function closeModal(modalId) {
    if (modals[modalId]) {
      modals[modalId].classList.remove('open');
    }
  }

  function closeAllModals() {
    Object.values(modals).forEach(m => {
      if (m) m.classList.remove('open');
    });
  }

  // Bind Open Buttons in Top Nav & Docks
  const btnOpenPlaylist = document.getElementById('btn-open-playlist');
  if (btnOpenPlaylist) btnOpenPlaylist.addEventListener('click', () => openModal('playlist'));

  const btnOpenSettings = document.getElementById('btn-settings');
  if (btnOpenSettings) {
    btnOpenSettings.addEventListener('click', () => {
      loadSettingsIntoModal();
      openModal('settings');
    });
  }

  const btnOpenTasks = document.getElementById('btn-tasks');
  if (btnOpenTasks) btnOpenTasks.addEventListener('click', () => openModal('tasks'));

  const btnOpenAmbient = document.getElementById('btn-ambient-mixer');
  if (btnOpenAmbient) btnOpenAmbient.addEventListener('click', () => openModal('ambient'));

  // Bind Close Buttons via data-close
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-close');
      const targetModal = document.getElementById(targetId);
      if (targetModal) targetModal.classList.remove('open');
    });
  });

  // Close when clicking modal backdrop overlay
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('open');
      }
    });
  });

  // 3. Wish Shooting Star Button
  const btnShootMeteor = document.getElementById('btn-shoot-meteor');
  if (btnShootMeteor) {
    btnShootMeteor.addEventListener('click', () => {
      scenery.triggerWishMeteor();
    });
  }

  // 4. Zen Mode (Toàn cảnh thơ mộng)
  const btnZen = document.getElementById('btn-zen');
  const zenOverlay = document.getElementById('zen-overlay');

  function toggleZenMode() {
    const isZen = document.body.classList.toggle('zen-active');
    if (btnZen) {
      const icon = btnZen.querySelector('svg') || btnZen.querySelector('i');
      if (icon) {
        btnZen.innerHTML = isZen 
          ? '<i data-lucide="minimize-2"></i>' 
          : '<i data-lucide="maximize-2"></i>';
        if (window.lucide) window.lucide.createIcons();
      }
    }
  }

  if (btnZen) btnZen.addEventListener('click', toggleZenMode);
  if (zenOverlay) zenOverlay.addEventListener('click', toggleZenMode);

  // 5. Settings Modal Sync & Save
  function loadSettingsIntoModal() {
    const p = window.pomodoroEngine;
    if (!p) return;

    const setPomo = document.getElementById('set-pomo-time');
    const setShort = document.getElementById('set-short-time');
    const setLong = document.getElementById('set-long-time');
    const setCycles = document.getElementById('set-cycles-count');
    const setAutoBreak = document.getElementById('set-auto-break');
    const setAutoPomo = document.getElementById('set-auto-pomo');
    const setChime = document.getElementById('set-chime-sound');

    if (setPomo) setPomo.value = p.settings.pomodoroTime;
    if (setShort) setShort.value = p.settings.shortBreakTime;
    if (setLong) setLong.value = p.settings.longBreakTime;
    if (setCycles) setCycles.value = p.settings.cyclesBeforeLongBreak;
    if (setAutoBreak) setAutoBreak.checked = p.settings.autoStartBreak;
    if (setAutoPomo) setAutoPomo.checked = p.settings.autoStartPomodoro;
    if (setChime) setChime.checked = p.settings.soundChime;

    // Scenery settings
    const setMeteor = document.getElementById('set-meteor-rate');
    const setWind = document.getElementById('set-wind-strength');
    const setParticle = document.getElementById('set-particle-count');
    const setMoon = document.getElementById('set-moon-style');

    if (setMeteor) setMeteor.value = scenery.config.meteorRate;
    if (setWind) setWind.value = scenery.config.windStrength;
    if (setParticle) setParticle.value = scenery.config.particleCount;
    if (setMoon) setMoon.value = scenery.config.moonStyle;
  }

  const btnSaveSettings = document.getElementById('btn-save-settings');
  if (btnSaveSettings) {
    btnSaveSettings.addEventListener('click', () => {
      const p = window.pomodoroEngine;
      if (!p) return;

      const setPomo = document.getElementById('set-pomo-time');
      const setShort = document.getElementById('set-short-time');
      const setLong = document.getElementById('set-long-time');
      const setCycles = document.getElementById('set-cycles-count');
      const setAutoBreak = document.getElementById('set-auto-break');
      const setAutoPomo = document.getElementById('set-auto-pomo');
      const setChime = document.getElementById('set-chime-sound');

      p.settings.pomodoroTime = Math.max(1, parseInt(setPomo.value) || 25);
      p.settings.shortBreakTime = Math.max(1, parseInt(setShort.value) || 5);
      p.settings.longBreakTime = Math.max(1, parseInt(setLong.value) || 15);
      p.settings.cyclesBeforeLongBreak = Math.max(1, parseInt(setCycles.value) || 4);
      p.settings.autoStartBreak = setAutoBreak.checked;
      p.settings.autoStartPomodoro = setAutoPomo.checked;
      p.settings.soundChime = setChime.checked;

      p.saveSettings();
      p.switchMode(p.currentMode); // re-apply current mode minutes
      p.renderSessionDots();

      // Scenery updates
      const setMeteor = document.getElementById('set-meteor-rate');
      const setWind = document.getElementById('set-wind-strength');
      const setParticle = document.getElementById('set-particle-count');
      const setMoon = document.getElementById('set-moon-style');

      scenery.updateConfig({
        meteorRate: parseInt(setMeteor.value) || 3,
        windStrength: parseInt(setWind.value) || 3,
        particleCount: parseInt(setParticle.value) || 50,
        moonStyle: setMoon.value || 'crescent'
      });

      closeModal('settings');
    });
  }

  // 6. Ambient Audio Mixer Controls
  const synth = window.ambientSynth;
  if (synth) {
    const ambientTypes = [
      { id: 'wind', toggleId: 'toggle-wind', volId: 'vol-wind', start: () => synth.startWind(), stop: () => synth.stopWind() },
      { id: 'crickets', toggleId: 'toggle-crickets', volId: 'vol-crickets', start: () => synth.startCrickets(), stop: () => synth.stopCrickets() },
      { id: 'rain', toggleId: 'toggle-rain', volId: 'vol-rain', start: () => synth.startRain(), stop: () => synth.stopRain() },
      { id: 'fire', toggleId: 'toggle-fire', volId: 'vol-fire', start: () => synth.startFire(), stop: () => synth.stopFire() }
    ];

    ambientTypes.forEach(item => {
      const btn = document.getElementById(item.toggleId);
      const slider = document.getElementById(item.volId);

      if (btn) {
        btn.addEventListener('click', () => {
          const isCurrentlyActive = synth.sounds[item.id].active;
          if (isCurrentlyActive) {
            item.stop();
            btn.classList.remove('active');
            btn.textContent = 'Turn On';
          } else {
            item.start();
            btn.classList.add('active');
            btn.textContent = 'Turn Off';
          }
        });
      }

      if (slider) {
        slider.addEventListener('input', (e) => {
          const val = Number(e.target.value) / 100;
          synth.setVolume(item.id, val);
        });
      }
    });

    // Test Bell Chime button
    const btnTestChime = document.getElementById('btn-test-chime');
    if (btnTestChime) {
      btnTestChime.addEventListener('click', () => {
        synth.playChime();
      });
    }
  }

  // 7. Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    // If typing in input or textarea, ignore shortcuts
    const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
      return;
    }

    // Spacebar: Shoot a wish meteor!
    if (e.code === 'Space') {
      e.preventDefault();
      scenery.triggerWishMeteor();
    }

    // Enter: Start / Pause Pomodoro Timer
    if (e.code === 'Enter') {
      e.preventDefault();
      if (window.pomodoroEngine) {
        window.pomodoroEngine.toggleStart();
      }
    }

    // 'Z' or 'z': Toggle Zen mode
    if (e.key === 'z' || e.key === 'Z') {
      e.preventDefault();
      toggleZenMode();
    }

    // Escape: Close modals or exit Zen
    if (e.code === 'Escape') {
      if (document.body.classList.contains('zen-active')) {
        toggleZenMode();
      } else {
        closeAllModals();
      }
    }
  });
});
