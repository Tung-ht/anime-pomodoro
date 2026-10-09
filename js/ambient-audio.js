/**
 * ============================================================================
 * AMBIENT AUDIO SYNTHESIZER (Web Audio API)
 * 100% Offline & Pure Waveform Synthesis - No external MP3 files needed!
 * Provides:
 *   - Gentle Night Breeze (Wind)
 *   - Summer Nocturnal Crickets (Rhythmic natural chirping)
 *   - Soothing Night Rain (Rainfall)
 *   - Cozy Hearth Fireplace (Warm crackle)
 *   - Tibetan Singing Bowl Bell Chime (Timer completion)
 * ============================================================================
 */

class AmbientSynthesizer {
  constructor() {
    this.ctx = null;
    this.isMuted = false;

    // Track state of each ambient sound
    this.sounds = {
      wind: { active: false, volume: 0.5, gainNode: null, stopFn: null },
      crickets: { active: false, volume: 0.45, gainNode: null, stopFn: null },
      rain: { active: false, volume: 0.5, gainNode: null, stopFn: null },
      fire: { active: false, volume: 0.5, gainNode: null, stopFn: null }
    };

    // Auto-resume audio context on first user interaction anywhere
    const unlockAudio = () => {
      this.ensureContext();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Helper: Create continuous pink noise buffer
  createPinkNoiseBuffer(seconds = 6) {
    const ctx = this.ensureContext();
    const bufferSize = ctx.sampleRate * seconds;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.18;
      b6 = white * 0.115926;
    }
    return noiseBuffer;
  }

  // ==========================================================================
  // 1. GENTLE NIGHT WIND
  // ==========================================================================
  startWind() {
    const ctx = this.ensureContext();
    if (this.sounds.wind.active) return;

    const noiseBuffer = this.createPinkNoiseBuffer(6);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Resonant lowpass filter with slow undulating cutoff (wind gusts)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, ctx.currentTime);
    filter.Q.setValueAtTime(3.5, ctx.currentTime);

    // LFO to modulate filter cutoff
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // 0.12 Hz slow wind cycle
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(220, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    // Master volume gain
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(this.sounds.wind.volume * 0.9, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noiseSource.start();
    lfo.start();

    this.sounds.wind.active = true;
    this.sounds.wind.gainNode = gainNode;
    this.sounds.wind.stopFn = () => {
      try {
        noiseSource.stop();
        lfo.stop();
        noiseSource.disconnect();
        filter.disconnect();
        gainNode.disconnect();
      } catch (e) {}
    };
  }

  stopWind() {
    if (this.sounds.wind.active && this.sounds.wind.stopFn) {
      this.sounds.wind.stopFn();
      this.sounds.wind.active = false;
      this.sounds.wind.gainNode = null;
    }
  }

  // ==========================================================================
  // 2. SUMMER NOCTURNAL CRICKETS (Natural rhythmic chirping bursts)
  // ==========================================================================
  startCrickets() {
    const ctx = this.ensureContext();
    if (this.sounds.crickets.active) return;

    let isRunning = true;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.sounds.crickets.volume * 0.8, ctx.currentTime);
    masterGain.connect(ctx.destination);

    // Function to schedule a natural 3-chirp burst
    const scheduleChirpBurst = () => {
      if (!isRunning) return;
      const t = ctx.currentTime;

      // Create dual carrier oscillators
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(4550, t);
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(4820, t);

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(4650, t);
      bandpass.Q.setValueAtTime(6.0, t);

      const burstGain = ctx.createGain();
      burstGain.gain.setValueAtTime(0.0001, t);

      // Chirp 1
      burstGain.gain.linearRampToValueAtTime(0.25, t + 0.025);
      burstGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
      // Chirp 2
      burstGain.gain.linearRampToValueAtTime(0.28, t + 0.115);
      burstGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.17);
      // Chirp 3
      burstGain.gain.linearRampToValueAtTime(0.32, t + 0.205);
      burstGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);

      osc1.connect(bandpass);
      osc2.connect(bandpass);
      bandpass.connect(burstGain);
      burstGain.connect(masterGain);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.35);
      osc2.stop(t + 0.35);

      // Schedule next burst with natural variation (between 1.1s and 2.2s)
      const nextDelay = 1100 + Math.random() * 1100;
      this.cricketTimer = setTimeout(scheduleChirpBurst, nextDelay);
    };

    scheduleChirpBurst();

    this.sounds.crickets.active = true;
    this.sounds.crickets.gainNode = masterGain;
    this.sounds.crickets.stopFn = () => {
      isRunning = false;
      if (this.cricketTimer) clearTimeout(this.cricketTimer);
      try {
        masterGain.disconnect();
      } catch (e) {}
    };
  }

  stopCrickets() {
    if (this.sounds.crickets.active && this.sounds.crickets.stopFn) {
      this.sounds.crickets.stopFn();
      this.sounds.crickets.active = false;
      this.sounds.crickets.gainNode = null;
    }
  }

  // ==========================================================================
  // 3. SOOTHING NIGHT RAIN
  // ==========================================================================
  startRain() {
    const ctx = this.ensureContext();
    if (this.sounds.rain.active) return;

    const bufferSize = ctx.sampleRate * 4;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.45;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Dual-stage filter for rich, organic rainfall
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(1400, ctx.currentTime);

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(280, ctx.currentTime);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(this.sounds.rain.volume * 0.8, ctx.currentTime);

    noiseSource.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(gainNode);
    gainNode.connect(ctx.destination);

    noiseSource.start();

    this.sounds.rain.active = true;
    this.sounds.rain.gainNode = gainNode;
    this.sounds.rain.stopFn = () => {
      try {
        noiseSource.stop();
        noiseSource.disconnect();
        lowpass.disconnect();
        highpass.disconnect();
        gainNode.disconnect();
      } catch (e) {}
    };
  }

  stopRain() {
    if (this.sounds.rain.active && this.sounds.rain.stopFn) {
      this.sounds.rain.stopFn();
      this.sounds.rain.active = false;
      this.sounds.rain.gainNode = null;
    }
  }

  // ==========================================================================
  // 4. COZY HEARTH FIREPLACE
  // ==========================================================================
  startFire() {
    const ctx = this.ensureContext();
    if (this.sounds.fire.active) return;

    const bufferSize = ctx.sampleRate * 4;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + (0.04 * white)) / 1.04;
      // Spontaneous crisp embers crackles
      const crackle = Math.random() < 0.004 ? (Math.random() * 1.2 - 0.6) : 0;
      output[i] = (lastOut * 0.45) + crackle;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(580, ctx.currentTime);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(this.sounds.fire.volume * 0.9, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noiseSource.start();

    this.sounds.fire.active = true;
    this.sounds.fire.gainNode = gainNode;
    this.sounds.fire.stopFn = () => {
      try {
        noiseSource.stop();
        noiseSource.disconnect();
        filter.disconnect();
        gainNode.disconnect();
      } catch (e) {}
    };
  }

  stopFire() {
    if (this.sounds.fire.active && this.sounds.fire.stopFn) {
      this.sounds.fire.stopFn();
      this.sounds.fire.active = false;
      this.sounds.fire.gainNode = null;
    }
  }

  // ==========================================================================
  // TIBETAN SINGING BOWL BELL CHIME (Timer completion & preview)
  // ==========================================================================
  playChime() {
    const ctx = this.ensureContext();
    const now = ctx.currentTime;

    // Peaceful meditative harmonics: 528Hz (Love/Healing Solfeggio), 1056Hz, 1584Hz
    const freqs = [528, 1056, 1584, 2112];
    const gains = [0.35, 0.18, 0.09, 0.04];

    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);

      gain.gain.setValueAtTime(gains[idx], now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 4.5);
    });
  }

  // Volume setter
  setVolume(soundType, val) {
    if (this.sounds[soundType]) {
      this.sounds[soundType].volume = val;
      if (this.sounds[soundType].gainNode && this.ctx) {
        this.sounds[soundType].gainNode.gain.setValueAtTime(val * 0.85, this.ctx.currentTime);
      }
    }
  }
}

// Global instance exposed
window.ambientSynth = new AmbientSynthesizer();
