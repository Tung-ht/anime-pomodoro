/**
 * ============================================================================
 * ANIME CANVAS SCENERY ENGINE
 * Aesthetic: Makoto Shinkai & Ghibli Night Sky
 * Features:
 *   - Deep Cosmic Gradient & Drifting Nebulae
 *   - Twinkling Stars & Anime Cross Sparkles
 *   - Ethereal Glowing Moon with Drifting Translucent Clouds
 *   - Realistic Anime Meteor Shower / Shooting Stars (Click to wish!)
 *   - Wind Gust Physics & Elegant Wind Streamlines
 *   - Fireflies & Stardust Floating with the Breeze
 *   - Layered Silhouette Hills & Procedural Swaying Grass
 *   - Cozy Anime Silhouette with Warm Glowing Lantern
 * ============================================================================
 */

class AnimeScenery {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    // Display sizing
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Settings (Configurable from UI)
    this.config = {
      meteorRate: 3,        // 1 to 5 (3 is balanced)
      windStrength: 3,      // 1 to 5
      particleCount: 50,    // 20 to 100
      moonStyle: 'crescent' // 'crescent', 'full', 'ethereal'
    };

    // Physics & Time state
    this.time = 0;
    this.lastTime = performance.now();
    this.globalWind = 1.0;
    this.windGust = 0;
    this.isTabVisible = true;

    // Entity collections
    this.stars = [];
    this.clouds = [];
    this.meteors = [];
    this.particles = [];
    this.windStreams = [];
    this.grassBlades = [];

    // Moon coordinates & radius
    this.moon = {
      x: 0,
      y: 0,
      radius: 46
    };

    // Lantern coordinates
    this.lantern = {
      x: 0,
      y: 0
    };

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    // Visibility listener to pause loop when user changes tab
    document.addEventListener('visibilitychange', () => {
      this.isTabVisible = !document.hidden;
      if (this.isTabVisible) {
        this.lastTime = performance.now();
        this.animate(this.lastTime);
      }
    });

    // Interactive Shooting Star: Click on the canvas/sky triggers a star towards that spot!
    window.addEventListener('pointerdown', (e) => {
      // Ignore clicks on buttons/cards/modals
      if (e.target.closest('.timer-card, .top-nav, .music-dock, .modal-card, .shortcuts-tip')) return;
      this.spawnInteractiveMeteor(e.clientX, e.clientY);
    });

    // Populate scenery entities
    this.generateStars();
    this.generateClouds();
    this.generateParticles();
    this.generateGrass();

    // Start render loop
    requestAnimationFrame((t) => this.animate(t));
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    // Update Moon position: Upper right quadrant
    this.moon.x = this.width * 0.78;
    this.moon.y = Math.max(80, this.height * 0.20);
    this.moon.radius = Math.max(38, Math.min(52, this.width * 0.04));

    // Update Lantern & Character position: on the lower-left slope
    this.lantern.x = this.width * 0.22;
    this.lantern.y = this.height * 0.88;

    // Regenerate grass according to new dimensions
    this.generateGrass();
  }

  // ==========================================================================
  // GENERATORS
  // ==========================================================================

  generateStars() {
    this.stars = [];
    const count = Math.floor((this.width * this.height) / 3800); // Responsive star density
    
    const colors = [
      '#ffffff',               // Pure white
      '#e0e7ff',               // Ice blue
      '#ede9fe',               // Soft lavender
      '#fef3c7',               // Starlight amber
      '#cffafe'                // Soft cyan
    ];

    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.height * 0.82), // Stars mostly in sky
        radius: Math.random() < 0.8 ? Math.random() * 1.2 + 0.4 : Math.random() * 1.6 + 1.2,
        baseAlpha: Math.random() * 0.6 + 0.3,
        twinkleSpeed: Math.random() * 2.5 + 1.0,
        twinklePhase: Math.random() * Math.PI * 2,
        isSparkle: Math.random() < 0.12, // 12% have anime 4-point sparkle
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }

  generateClouds() {
    this.clouds = [];
    // 6 soft, drifting translucent clouds
    const cloudCount = 7;
    for (let i = 0; i < cloudCount; i++) {
      this.clouds.push({
        x: (i / cloudCount) * this.width * 1.4 - this.width * 0.2,
        y: Math.random() * (this.height * 0.45) + 30,
        width: Math.random() * 280 + 200,
        height: Math.random() * 60 + 40,
        speed: (Math.random() * 0.06 + 0.03) * (this.config.windStrength * 0.4),
        alpha: Math.random() * 0.15 + 0.08
      });
    }
  }

  generateParticles() {
    this.particles = [];
    const count = this.config.particleCount;

    for (let i = 0; i < count; i++) {
      const isFirefly = Math.random() < 0.45; // 45% Fireflies, 55% Stardust/Sakura
      this.particles.push({
        x: Math.random() * this.width,
        y: isFirefly 
          ? this.height * 0.65 + Math.random() * (this.height * 0.3) 
          : Math.random() * this.height,
        radius: isFirefly ? Math.random() * 2 + 1.2 : Math.random() * 1.5 + 0.6,
        type: isFirefly ? 'firefly' : 'stardust',
        vx: Math.random() * 0.6 + 0.2,
        vy: (Math.random() - 0.5) * 0.3,
        pulseSpeed: Math.random() * 3 + 1.5,
        pulsePhase: Math.random() * Math.PI * 2,
        color: isFirefly 
          ? (Math.random() < 0.6 ? '#6ee7b7' : '#fde047') // Emerald or Golden Firefly
          : (Math.random() < 0.5 ? '#f472b6' : '#93c5fd')  // Sakura or Stardust
      });
    }
  }

  generateGrass() {
    this.grassBlades = [];
    // Dense grass blades along the foreground hill curve
    const bladeCount = Math.floor(this.width / 4);

    for (let i = 0; i < bladeCount; i++) {
      const x = (i / bladeCount) * this.width;
      // Hill baseline formula: gentle slope
      const hillBaseY = this.getHillY(x);
      
      this.grassBlades.push({
        x: x + (Math.random() - 0.5) * 3,
        y: hillBaseY,
        length: Math.random() * 18 + 14,
        width: Math.random() * 2.2 + 1.2,
        lean: (Math.random() - 0.3) * 0.4,
        swayPhase: Math.random() * Math.PI * 2,
        color: Math.random() < 0.6 ? '#0b1329' : (Math.random() < 0.5 ? '#101a38' : '#080d1d')
      });
    }
  }

  getHillY(x) {
    // Elegant silhouette curve: higher on left (cliff) and gentle dip in middle
    const normalized = x / this.width;
    const curve = Math.sin(normalized * Math.PI * 1.1 + 0.3) * 45;
    const slope = (1 - normalized * 0.35) * 80;
    return this.height - 170 + curve - slope;
  }

  // ==========================================================================
  // METEOR (SHOOTING STAR) SYSTEM
  // ==========================================================================

  spawnRandomMeteor() {
    // Random angle: -32 to -45 degrees
    const angle = (-36 + (Math.random() - 0.5) * 12) * (Math.PI / 180);
    const speed = Math.random() * 14 + 18;
    
    // Spawn from upper screen
    const startX = Math.random() * (this.width * 1.1) - (this.width * 0.1);
    const startY = Math.random() * (this.height * 0.35);

    this.meteors.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: -Math.sin(angle) * speed,
      length: Math.random() * 160 + 120,
      thickness: Math.random() * 2.2 + 1.4,
      alpha: 1.0,
      decay: Math.random() * 0.012 + 0.016,
      sparkTrail: [],
      color: Math.random() < 0.6 ? '#ffffff' : (Math.random() < 0.5 ? '#a5f3fc' : '#fbcfe8')
    });
  }

  spawnInteractiveMeteor(targetX, targetY) {
    const angle = -38 * (Math.PI / 180);
    const speed = 24;

    // Backtrack to start offscreen or above target
    const distance = 400;
    const startX = targetX - Math.cos(angle) * distance;
    const startY = targetY + Math.sin(angle) * distance;

    this.meteors.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: -Math.sin(angle) * speed,
      length: 220,
      thickness: 3.2,
      alpha: 1.0,
      decay: 0.015,
      sparkTrail: [],
      color: '#fef08a' // Golden wish meteor!
    });
  }

  triggerWishMeteor() {
    this.spawnInteractiveMeteor(this.width * 0.5, this.height * 0.3);
  }

  // ==========================================================================
  // WIND SYSTEM
  // ==========================================================================

  spawnWindStream() {
    const y = Math.random() * (this.height * 0.7) + 50;
    this.windStreams.push({
      x: -150,
      y: y,
      length: Math.random() * 260 + 180,
      speed: (Math.random() * 5 + 6) * (this.config.windStrength * 0.4),
      curveOffset: (Math.random() - 0.5) * 40,
      alpha: Math.random() * 0.25 + 0.15,
      decay: 0.003
    });
  }

  // ==========================================================================
  // MAIN RENDER & ANIMATION LOOP
  // ==========================================================================

  animate(now) {
    if (!this.isTabVisible) return;

    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;
    this.time += dt;

    // Update global wind pulse
    this.windGust = Math.sin(this.time * 0.8) * 0.5 + Math.cos(this.time * 0.3) * 0.3;
    this.globalWind = Math.max(0.2, (this.config.windStrength * 0.5) + this.windGust * 0.4);

    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Cosmic Night Sky & Nebulae
    this.drawSky();

    // 2. Draw Stars & Cross Sparkles
    this.drawStars(dt);

    // 3. Draw The Ethereal Moon (Clean crescent or full moon)
    this.drawMoon();

    // 4. Update & Draw Meteors (Shooting Stars)
    this.updateAndDrawMeteors(dt);

    // 5. Update & Draw Floating Particles (Fireflies & Stardust)
    this.updateAndDrawParticles(dt);

    // 6. Draw Foreground Hills, Grass & Anime Silhouette
    this.drawForeground(dt);

    // Periodically spawn random meteors based on user setting
    // Setting 1: rare, 3: normal, 5: meteor shower!
    const meteorProbability = (this.config.meteorRate * 0.006) + 0.004;
    if (Math.random() < meteorProbability) {
      this.spawnRandomMeteor();
    }

    requestAnimationFrame((t) => this.animate(t));
  }

  // ==========================================================================
  // DRAWING ROUTINES
  // ==========================================================================

  drawSky() {
    // Deep Makoto Shinkai Night Sky Gradient
    const skyGrad = this.ctx.createLinearGradient(0, 0, 0, this.height);
    skyGrad.addColorStop(0.0, '#030511'); // Deep cosmic void
    skyGrad.addColorStop(0.3, '#090e29'); // Midnight indigo
    skyGrad.addColorStop(0.6, '#14173d'); // Deep violet starlight
    skyGrad.addColorStop(0.85, '#1e1c48'); // Shinkai magenta-purple
    skyGrad.addColorStop(1.0, '#10223f'); // Horizon teal starlight glow

    this.ctx.fillStyle = skyGrad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Glowing Nebula Clouds (Cosmic dust)
    this.drawNebulaPuff(this.width * 0.35, this.height * 0.25, 260, 'rgba(129, 140, 248, 0.06)');
    this.drawNebulaPuff(this.width * 0.72, this.height * 0.35, 300, 'rgba(192, 132, 252, 0.07)');
    this.drawNebulaPuff(this.width * 0.50, this.height * 0.60, 220, 'rgba(56, 189, 248, 0.05)');
  }

  drawNebulaPuff(x, y, radius, color) {
    const pulse = Math.sin(this.time * 0.5 + x) * 15;
    const r = Math.max(10, radius + pulse);
    const grad = this.ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, color);
    grad.addColorStop(1, 'transparent');

    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawStars(dt) {
    for (const star of this.stars) {
      star.twinklePhase += star.twinkleSpeed * dt;
      const alphaFactor = Math.sin(star.twinklePhase) * 0.4 + 0.6;
      const currentAlpha = Math.min(1, Math.max(0.1, star.baseAlpha * alphaFactor));

      this.ctx.fillStyle = star.color;
      this.ctx.globalAlpha = currentAlpha;

      // Draw point
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Draw 4-point anime sparkle for prominent stars
      if (star.isSparkle && currentAlpha > 0.6) {
        const sparkleLen = star.radius * 4.5 * (currentAlpha - 0.5);
        this.ctx.strokeStyle = star.color;
        this.ctx.lineWidth = 0.8;
        this.ctx.beginPath();
        // Horizontal ray
        this.ctx.moveTo(star.x - sparkleLen, star.y);
        this.ctx.lineTo(star.x + sparkleLen, star.y);
        // Vertical ray
        this.ctx.moveTo(star.x, star.y - sparkleLen);
        this.ctx.lineTo(star.x, star.y + sparkleLen);
        this.ctx.stroke();
      }
    }
    this.ctx.globalAlpha = 1.0;
  }

  drawMoon() {
    const { x, y, radius } = this.moon;
    const style = this.config.moonStyle;

    this.ctx.save();

    if (style === 'crescent') {
      // 1. Soft glowing corona focused along the crescent light curve
      const cx = x + radius * 0.32;
      const cy = y;

      const crescentHalos = [
        { r: radius * 2.8, color: 'rgba(254, 240, 138, 0.04)' },
        { r: radius * 1.8, color: 'rgba(254, 249, 195, 0.08)' },
        { r: radius * 1.1, color: 'rgba(255, 255, 255, 0.14)' }
      ];

      for (const halo of crescentHalos) {
        const g = this.ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, halo.r);
        g.addColorStop(0, halo.color);
        g.addColorStop(1, 'transparent');
        this.ctx.fillStyle = g;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, halo.r, 0, Math.PI * 2);
        this.ctx.fill();
      }

      // 2. Sharp, elegant anime crescent using offscreen composite
      // ONLY the bright crescent is drawn; unlit part blends seamlessly into the night sky!
      const buffer = document.createElement('canvas');
      const bSize = Math.ceil(radius * 2 + 60);
      buffer.width = bSize;
      buffer.height = bSize;
      const bCtx = buffer.getContext('2d');
      const bx = bSize / 2;
      const by = bSize / 2;

      // Full glowing moon circle
      const moonGrad = bCtx.createLinearGradient(bx - radius, by - radius, bx + radius, by + radius);
      moonGrad.addColorStop(0, '#ffffff');
      moonGrad.addColorStop(0.45, '#fef9c3');
      moonGrad.addColorStop(1, '#fde047');
      bCtx.fillStyle = moonGrad;
      bCtx.beginPath();
      bCtx.arc(bx, by, radius, 0, Math.PI * 2);
      bCtx.fill();

      // Cut out inner circle with destination-out
      bCtx.globalCompositeOperation = 'destination-out';
      bCtx.beginPath();
      // Offset cutout to upper-left so crescent sits cleanly on right
      bCtx.arc(bx - radius * 0.42, by - radius * 0.15, radius * 0.94, 0, Math.PI * 2);
      bCtx.fill();

      // 3. Draw buffered crescent onto main canvas with warm starlight glow
      this.ctx.shadowColor = '#fef08a';
      this.ctx.shadowBlur = 24;
      this.ctx.drawImage(buffer, x - bx, y - by);
      this.ctx.shadowBlur = 0;

    } else if (style === 'full') {
      // Halos for full moon
      const haloGlows = [
        { r: radius * 3.8, color: 'rgba(192, 132, 252, 0.05)' },
        { r: radius * 2.4, color: 'rgba(165, 243, 252, 0.10)' },
        { r: radius * 1.5, color: 'rgba(255, 255, 255, 0.22)' }
      ];

      for (const halo of haloGlows) {
        const g = this.ctx.createRadialGradient(x, y, radius * 0.4, x, y, halo.r);
        g.addColorStop(0, halo.color);
        g.addColorStop(1, 'transparent');
        this.ctx.fillStyle = g;
        this.ctx.beginPath();
        this.ctx.arc(x, y, halo.r, 0, Math.PI * 2);
        this.ctx.fill();
      }
      // Ethereal Full Moon (Trăng tròn lung linh)
      this.ctx.shadowColor = '#e0e7ff';
      this.ctx.shadowBlur = 24;

      const fullMoonGrad = this.ctx.createRadialGradient(
        x - radius * 0.3, y - radius * 0.3, radius * 0.1,
        x, y, radius
      );
      fullMoonGrad.addColorStop(0, '#ffffff');
      fullMoonGrad.addColorStop(0.7, '#fef9c3');
      fullMoonGrad.addColorStop(1, '#e2e8f0');

      this.ctx.fillStyle = fullMoonGrad;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Subtle lunar crater shadows
      this.ctx.fillStyle = 'rgba(148, 163, 184, 0.18)';
      this.ctx.beginPath();
      this.ctx.arc(x - radius * 0.25, y - radius * 0.2, radius * 0.25, 0, Math.PI * 2);
      this.ctx.arc(x + radius * 0.3, y + radius * 0.2, radius * 0.35, 0, Math.PI * 2);
      this.ctx.arc(x - radius * 0.1, y + radius * 0.4, radius * 0.2, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.shadowBlur = 0;

    } else {
      // Ethereal Purple/Rose Moon
      this.ctx.shadowColor = '#c084fc';
      this.ctx.shadowBlur = 30;

      const etherGrad = this.ctx.createRadialGradient(
        x - radius * 0.2, y - radius * 0.2, radius * 0.1,
        x, y, radius
      );
      etherGrad.addColorStop(0, '#ffffff');
      etherGrad.addColorStop(0.5, '#e9d5ff');
      etherGrad.addColorStop(1, '#c084fc');

      this.ctx.fillStyle = etherGrad;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }

    this.ctx.restore();
  }

  drawClouds(dt) {
    for (const cloud of this.clouds) {
      cloud.x += cloud.speed * (1 + this.windGust * 0.5);
      if (cloud.x - cloud.width > this.width) {
        cloud.x = -cloud.width - 50;
        cloud.y = Math.random() * (this.height * 0.45) + 30;
      }

      this.ctx.save();
      this.ctx.globalAlpha = cloud.alpha;

      const grad = this.ctx.createRadialGradient(
        cloud.x + cloud.width * 0.5, cloud.y + cloud.height * 0.5, 0,
        cloud.x + cloud.width * 0.5, cloud.y + cloud.height * 0.5, cloud.width * 0.5
      );
      grad.addColorStop(0, 'rgba(216, 180, 254, 0.35)');
      grad.addColorStop(0.5, 'rgba(147, 197, 253, 0.18)');
      grad.addColorStop(1, 'transparent');

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.ellipse(
        cloud.x + cloud.width * 0.5,
        cloud.y + cloud.height * 0.5,
        cloud.width * 0.5,
        cloud.height * 0.5,
        0, 0, Math.PI * 2
      );
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  updateAndDrawMeteors(dt) {
    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const m = this.meteors[i];

      // Update position
      m.x += m.vx;
      m.y += m.vy;
      m.alpha -= m.decay;

      // Add sparks along trail
      if (Math.random() < 0.45 && m.alpha > 0.3) {
        m.sparkTrail.push({
          x: m.x + (Math.random() - 0.5) * 4,
          y: m.y + (Math.random() - 0.5) * 4,
          alpha: m.alpha * 0.9,
          radius: Math.random() * 1.5 + 0.8
        });
      }

      // Draw sparks
      for (let j = m.sparkTrail.length - 1; j >= 0; j--) {
        const sp = m.sparkTrail[j];
        sp.alpha -= 0.04;
        if (sp.alpha <= 0) {
          m.sparkTrail.splice(j, 1);
          continue;
        }
        this.ctx.fillStyle = m.color;
        this.ctx.globalAlpha = sp.alpha;
        this.ctx.beginPath();
        this.ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
        this.ctx.fill();
      }

      if (m.alpha <= 0 || m.x < -100 || m.y > this.height + 100) {
        this.meteors.splice(i, 1);
        continue;
      }

      // Draw Meteor Tail
      this.ctx.save();
      const tailX = m.x - (m.vx / Math.hypot(m.vx, m.vy)) * m.length;
      const tailY = m.y - (m.vy / Math.hypot(m.vx, m.vy)) * m.length;

      const grad = this.ctx.createLinearGradient(m.x, m.y, tailX, tailY);
      grad.addColorStop(0, m.color);
      grad.addColorStop(0.3, 'rgba(192, 132, 252, 0.7)');
      grad.addColorStop(1, 'transparent');

      this.ctx.strokeStyle = grad;
      this.ctx.lineWidth = m.thickness;
      this.ctx.lineCap = 'round';
      this.ctx.globalAlpha = m.alpha;

      this.ctx.beginPath();
      this.ctx.moveTo(m.x, m.y);
      this.ctx.lineTo(tailX, tailY);
      this.ctx.stroke();

      // Radiant glowing head
      this.ctx.fillStyle = '#ffffff';
      this.ctx.shadowColor = m.color;
      this.ctx.shadowBlur = 14;
      this.ctx.beginPath();
      this.ctx.arc(m.x, m.y, m.thickness * 1.2, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    }
    this.ctx.globalAlpha = 1.0;
  }

  updateAndDrawWind(dt) {
    for (let i = this.windStreams.length - 1; i >= 0; i--) {
      const ws = this.windStreams[i];
      ws.x += ws.speed;
      ws.alpha -= ws.decay;

      if (ws.alpha <= 0 || ws.x > this.width + 100) {
        this.windStreams.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = ws.alpha;
      this.ctx.strokeStyle = 'rgba(224, 231, 255, 0.7)';
      this.ctx.lineWidth = 1.2;

      this.ctx.beginPath();
      this.ctx.moveTo(ws.x, ws.y);
      // Gentle swooshing anime breeze curve
      this.ctx.quadraticCurveTo(
        ws.x + ws.length * 0.5, ws.y + ws.curveOffset,
        ws.x + ws.length, ws.y + ws.curveOffset * 0.3
      );
      this.ctx.stroke();
      this.ctx.restore();
    }
  }

  updateAndDrawParticles(dt) {
    for (const p of this.particles) {
      // Wind pushes particles horizontally
      p.x += (p.vx + this.globalWind * 0.8);
      p.y += p.vy + Math.sin(this.time * 2 + p.pulsePhase) * 0.4;

      // Wrap around screen
      if (p.x > this.width + 30) p.x = -30;
      if (p.y > this.height + 20) p.y = -20;
      if (p.y < -20) p.y = this.height + 20;

      // Pulse brightness
      p.pulsePhase += p.pulseSpeed * dt;
      const alpha = Math.sin(p.pulsePhase) * 0.45 + 0.55;

      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = p.color;

      if (p.type === 'firefly') {
        // Glowing halo for fireflies
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 10;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        // Stardust: clean circular glowing point
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 6;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    }
  }

  drawForeground(dt) {
    this.ctx.save();

    // 1. Distant Back Hill Silhouette (Soft Deep Purple)
    this.ctx.fillStyle = '#060a1f';
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.height);
    this.ctx.lineTo(0, this.height - 180);
    this.ctx.bezierCurveTo(
      this.width * 0.3, this.height - 240,
      this.width * 0.7, this.height - 140,
      this.width, this.height - 190
    );
    this.ctx.lineTo(this.width, this.height);
    this.ctx.closePath();
    this.ctx.fill();

    // 2. Main Foreground Hill Silhouette
    this.ctx.fillStyle = '#040614';
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.height);
    this.ctx.lineTo(0, this.getHillY(0));
    
    // Smooth curve across hill
    for (let x = 0; x <= this.width; x += 30) {
      this.ctx.lineTo(x, this.getHillY(x));
    }
    this.ctx.lineTo(this.width, this.height);
    this.ctx.closePath();
    this.ctx.fill();

    // 3. Procedural Swaying Grass Blades
    const windForce = this.globalWind * 0.35;
    for (const blade of this.grassBlades) {
      // Physical sway formula based on wind gusts and blade length
      const swayAngle = Math.sin(this.time * 2.8 + blade.swayPhase) * (0.25 * windForce) + blade.lean + (windForce * 0.3);
      const tipX = blade.x + Math.sin(swayAngle) * blade.length;
      const tipY = blade.y - Math.cos(swayAngle) * blade.length;

      this.ctx.strokeStyle = blade.color;
      this.ctx.lineWidth = blade.width;
      this.ctx.lineCap = 'round';

      this.ctx.beginPath();
      this.ctx.moveTo(blade.x, blade.y);
      this.ctx.quadraticCurveTo(
        blade.x + (tipX - blade.x) * 0.3,
        blade.y - blade.length * 0.5,
        tipX,
        tipY
      );
      this.ctx.stroke();
    }

    // 4. Cozy Anime Scene: Studying/Stargazing Silhouette on the Hill
    this.drawAnimeCharacter();

    // 5. Warm Glowing Lantern on the Grass
    this.drawWarmLantern();

    this.ctx.restore();
  }

  drawAnimeCharacter() {
    const cx = this.lantern.x + 45;
    const cy = this.getHillY(cx) - 8;

    this.ctx.save();
    this.ctx.fillStyle = '#040614'; // Dark silhouette matching foreground

    // Sitting figure gazing at the sky
    // Body / Torso
    this.ctx.beginPath();
    this.ctx.ellipse(cx, cy - 18, 14, 22, -0.15, 0, Math.PI * 2);
    this.ctx.fill();

    // Head
    this.ctx.beginPath();
    this.ctx.arc(cx - 3, cy - 42, 9, 0, Math.PI * 2);
    this.ctx.fill();

    // Wind-blown hair strands
    const hairSway = Math.sin(this.time * 3) * (this.globalWind * 3);
    this.ctx.beginPath();
    this.ctx.moveTo(cx - 9, cy - 42);
    this.ctx.quadraticCurveTo(cx - 20 - hairSway, cy - 35, cx - 18 - hairSway, cy - 24);
    this.ctx.lineTo(cx - 10, cy - 36);
    this.ctx.fill();

    // Cat sitting peacefully next to the figure
    const catX = cx + 24;
    const catY = cy + 2;
    // Cat body
    this.ctx.beginPath();
    this.ctx.ellipse(catX, catY - 8, 8, 10, 0.2, 0, Math.PI * 2);
    this.ctx.fill();
    // Cat head & cute pointed ears
    this.ctx.beginPath();
    this.ctx.arc(catX - 1, catY - 20, 6, 0, Math.PI * 2);
    this.ctx.fill();
    // Ears
    this.ctx.beginPath();
    this.ctx.moveTo(catX - 5, catY - 24);
    this.ctx.lineTo(catX - 3, catY - 30);
    this.ctx.lineTo(catX, catY - 25);
    this.ctx.fill();
    // Tail gently curling
    const tailCurl = Math.sin(this.time * 2) * 4;
    this.ctx.strokeStyle = '#040614';
    this.ctx.lineWidth = 2.5;
    this.ctx.beginPath();
    this.ctx.moveTo(catX + 6, catY - 4);
    this.ctx.quadraticCurveTo(catX + 16, catY - 14 + tailCurl, catX + 12, catY - 20);
    this.ctx.stroke();

    this.ctx.restore();
  }

  drawWarmLantern() {
    const lx = this.lantern.x;
    const ly = this.getHillY(lx) - 14;

    this.ctx.save();

    // Warm Lantern Light Pulse (Breathing warm glow)
    const flicker = Math.sin(this.time * 4.5) * 3 + Math.cos(this.time * 7) * 2;
    const glowRadius = 85 + flicker;

    const lanternGlow = this.ctx.createRadialGradient(lx, ly, 2, lx, ly, glowRadius);
    lanternGlow.addColorStop(0, 'rgba(254, 215, 170, 0.7)'); // Warm peach/gold
    lanternGlow.addColorStop(0.35, 'rgba(251, 146, 60, 0.25)'); // Cozy amber
    lanternGlow.addColorStop(1, 'transparent');

    this.ctx.fillStyle = lanternGlow;
    this.ctx.beginPath();
    this.ctx.arc(lx, ly, glowRadius, 0, Math.PI * 2);
    this.ctx.fill();

    // Physical lantern casing silhouette
    this.ctx.fillStyle = '#0f172a';
    this.ctx.strokeStyle = '#0f172a';
    this.ctx.lineWidth = 2;

    // Roof / Cap
    this.ctx.beginPath();
    this.ctx.moveTo(lx - 9, ly - 10);
    this.ctx.lineTo(lx, ly - 17);
    this.ctx.lineTo(lx + 9, ly - 10);
    this.ctx.closePath();
    this.ctx.fill();

    // Handle
    this.ctx.beginPath();
    this.ctx.arc(lx, ly - 18, 5, Math.PI, 0);
    this.ctx.stroke();

    // Base
    this.ctx.fillRect(lx - 8, ly + 8, 16, 4);

    // Glowing flame core inside
    this.ctx.fillStyle = '#fef08a';
    this.ctx.shadowColor = '#f59e0b';
    this.ctx.shadowBlur = 12;
    this.ctx.beginPath();
    this.ctx.arc(lx, ly - 1, 4.5, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  // ==========================================================================
  // CONFIGURATION HOOKS
  // ==========================================================================

  updateConfig(newConfig) {
    Object.assign(this.config, newConfig);
    if (newConfig.particleCount !== undefined) {
      this.generateParticles();
    }
  }
}

// Global instance exposed
window.AnimeScenery = AnimeScenery;
