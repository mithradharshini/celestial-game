/**
 * CELESTIAL — Night-Sky Memory Matching Game
 * Pure Vanilla JavaScript: Canvas Engine, Stage Configurations & Game Mechanics
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. Stage Configurations (Single Source of Truth)
     ========================================================================== */
  const STAGES = [
    {
      stageNum: 1,
      name: "CRESCENT",
      icon: "🌙",
      moonPhase: 0.18, // Crescent 🌒
      cols: 4,
      rows: 3,
      pairs: 6,
      symbols: ['🌙', '⭐', '☀️', '☁️', '🪐', '☄️'],
      timer: null,
      completeHeading: "🌙 STAGE COMPLETE",
      completeSubline: "The first stars have aligned.",
      hasShimmer: false,
      hasEclipse: false,
    },
    {
      stageNum: 2,
      name: "HALF MOON",
      icon: "🌓",
      moonPhase: 0.5, // Half Moon 🌓
      cols: 4,
      rows: 4,
      pairs: 8,
      symbols: ['🌙', '⭐', '☀️', '☁️', '🪐', '☄️', '🌑', '🌌'],
      timer: null,
      completeHeading: "STAGE COMPLETE",
      completeSubline: "The sky is waking.",
      hasShimmer: true, // Shimmer after every 3rd successful match (3rd & 6th)
      hasEclipse: false,
    },
    {
      stageNum: 3,
      name: "GIBBOUS",
      icon: "🌔",
      moonPhase: 0.8, // Gibbous 🌔
      cols: 5,
      rows: 4,
      pairs: 10,
      symbols: ['🌙', '⭐', '☀️', '☁️', '🪐', '☄️', '🌑', '🌌', '✨', '🌠'],
      timer: null,
      completeHeading: "STAGE COMPLETE",
      completeSubline: "The moon grows fuller.",
      hasShimmer: false,
      hasEclipse: false,
    },
    {
      stageNum: 4,
      name: "FULL MOON",
      icon: "🌕",
      moonPhase: 1.0, // Full Moon 🌕
      cols: 6,
      rows: 4,
      pairs: 12,
      symbols: ['🌙', '⭐', '☀️', '☁️', '🪐', '☄️', '🌑', '🌌', '✨', '🌠', '🔵', '🔴'],
      timer: null,
      completeHeading: "THE SKY IS COMPLETE.",
      completeSubline: "All phases have converged.",
      hasShimmer: false,
      hasEclipse: true, // Eclipse tile dims other tiles
    },
    {
      stageNum: 5,
      name: "CONSTELLATION",
      icon: "⭐",
      moonPhase: 1.0,
      cols: 6,
      rows: 5,
      pairs: 15,
      // 15 distinct celestial symbols as specified
      symbols: [
        '🌙', '☀️', '⭐', '☁️', '🪐', '☄️', 
        '🌑', '🌌', '✨', '🌠', '🔵', '🔴', 
        '🌛', '🌟', '🌞'
      ],
      timer: null,
      completeHeading: "CONSTELLATION COMPLETE",
      completeSubline: "You remembered the sky.",
      hasShimmer: false,
      hasEclipse: true,
      isFinal: true
    }
  ];

  /* Constellation star coordinates for the Stage 5 Finale (normalized 0..1) */
  const CONSTELLATION_NODES = [
    { x: 0.50, y: 0.22, name: "Polaris" },
    { x: 0.38, y: 0.28 },
    { x: 0.30, y: 0.36 },
    { x: 0.34, y: 0.46 },
    { x: 0.44, y: 0.45 },
    { x: 0.56, y: 0.44 },
    { x: 0.65, y: 0.36 },
    { x: 0.70, y: 0.26 },
    { x: 0.60, y: 0.24 },
    { x: 0.50, y: 0.34 },
    { x: 0.44, y: 0.54 },
    { x: 0.56, y: 0.54 },
    { x: 0.50, y: 0.60 },
    { x: 0.38, y: 0.68 },
    { x: 0.62, y: 0.68 }
  ];

  const CONSTELLATION_EDGES = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 0],
    [0, 9], [9, 4], [9, 5], [4, 10], [5, 11], [10, 12], [11, 12], [12, 13], [12, 14]
  ];

  /* SVG Constellation pattern for tile backs */
  const TILE_BACK_SVG = `
    <svg class="tile-constellation" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#f5d77f" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#f5d77f" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <line x1="20" y1="25" x2="48" y2="18" stroke="rgba(245,215,127,0.25)" stroke-width="0.8" />
      <line x1="48" y1="18" x2="80" y2="30" stroke="rgba(245,215,127,0.25)" stroke-width="0.8" />
      <line x1="80" y1="30" x2="72" y2="75" stroke="rgba(245,215,127,0.25)" stroke-width="0.8" />
      <line x1="72" y1="75" x2="25" y2="80" stroke="rgba(245,215,127,0.25)" stroke-width="0.8" />
      <line x1="25" y1="80" x2="20" y2="25" stroke="rgba(245,215,127,0.25)" stroke-width="0.8" />
      <line x1="48" y1="18" x2="50" y2="50" stroke="rgba(167,139,250,0.2)" stroke-width="0.7" stroke-dasharray="2,2"/>
      <line x1="25" y1="80" x2="50" y2="50" stroke="rgba(167,139,250,0.2)" stroke-width="0.7" stroke-dasharray="2,2"/>
      <circle cx="20" cy="25" r="1.8" fill="#f5d77f" opacity="0.8" />
      <circle cx="48" cy="18" r="1.5" fill="#f8fafc" opacity="0.9" />
      <circle cx="80" cy="30" r="1.8" fill="#f5d77f" opacity="0.8" />
      <circle cx="72" cy="75" r="1.5" fill="#a78bfa" opacity="0.8" />
      <circle cx="25" cy="80" r="1.8" fill="#f8fafc" opacity="0.8" />
    </svg>
  `;

  /* ==========================================================================
     2. Canvas Starfield & Moon Engine
     ========================================================================== */
  class SkyEngine {
    constructor() {
      this.skyCanvas = document.getElementById('sky-canvas');
      this.skyCtx = this.skyCanvas.getContext('2d');
      this.partCanvas = document.getElementById('particle-canvas');
      this.partCtx = this.partCanvas.getContext('2d');

      this.width = 0;
      this.height = 0;
      this.stars = [];
      this.particles = [];
      this.constellationParticles = [];
      this.constellationProgress = 0;
      this.isConstellationMode = false;

      // Moon rendering state
      this.currentMoonPhase = 0.18; // 0..1
      this.targetMoonPhase = 0.18;
      this.moonTransitionAlpha = 1;

      this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      this.resize();
      this.initStars();

      window.addEventListener('resize', () => {
        this.resize();
        this.initStars();
      });

      this.loop = this.loop.bind(this);
      requestAnimationFrame(this.loop);
    }

    resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.width = window.innerWidth;
      this.height = window.innerHeight;

      this.skyCanvas.width = this.width * dpr;
      this.skyCanvas.height = this.height * dpr;
      this.skyCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      this.partCanvas.width = this.width * dpr;
      this.partCanvas.height = this.height * dpr;
      this.partCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    initStars() {
      const count = Math.floor((this.width * this.height) / 8000) + 60;
      this.stars = [];
      for (let i = 0; i < count; i++) {
        this.stars.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: Math.random() * 1.3 + 0.4,
          baseAlpha: Math.random() * 0.6 + 0.2,
          twinkleSpeed: Math.random() * 0.02 + 0.008,
          phase: Math.random() * Math.PI * 2,
          driftX: (Math.random() - 0.5) * 0.06,
          driftY: - (Math.random() * 0.05 + 0.02),
          color: Math.random() > 0.8 ? '#f5d77f' : (Math.random() > 0.6 ? '#c084fc' : '#f8fafc')
        });
      }
    }

    setMoonPhase(phase, animate = false) {
      if (animate) {
        this.targetMoonPhase = phase;
      } else {
        this.targetMoonPhase = phase;
        this.currentMoonPhase = phase;
      }
    }

    emitDissolveParticles(x, y, symbol) {
      const count = this.prefersReducedMotion ? 12 : 28;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2.8 + 0.6;
        const size = Math.random() * 2.5 + 1.2;
        const life = Math.random() * 35 + 25;
        this.particles.push({
          x: x + (Math.random() - 0.5) * 40,
          y: y + (Math.random() - 0.5) * 40,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.5,
          alpha: 1,
          size: size,
          maxLife: life,
          life: life,
          color: Math.random() > 0.5 ? '#f5d77f' : '#e2e8f0'
        });
      }
    }

    startConstellationFinale(finalTileA, finalTileB, onComplete) {
      this.isConstellationMode = true;
      this.constellationProgress = 0;
      this.particles = [];
      this.constellationParticles = [];

      const rectA = finalTileA.getBoundingClientRect();
      const rectB = finalTileB.getBoundingClientRect();
      const centerA = { x: rectA.left + rectA.width / 2, y: rectA.top + rectA.height / 2 };
      const centerB = { x: rectB.left + rectB.width / 2, y: rectB.top + rectB.height / 2 };

      // Create rising stardust from both tiles
      const totalStarCount = CONSTELLATION_NODES.length;
      CONSTELLATION_NODES.forEach((node, idx) => {
        const startOrigin = idx % 2 === 0 ? centerA : centerB;
        const targetX = node.x * this.width;
        const targetY = node.y * this.height;

        this.constellationParticles.push({
          x: startOrigin.x + (Math.random() - 0.5) * 30,
          y: startOrigin.y + (Math.random() - 0.5) * 30,
          startX: startOrigin.x,
          startY: startOrigin.y,
          targetX: targetX,
          targetY: targetY,
          size: idx === 0 ? 4 : 2.5,
          alpha: 1,
          reached: false
        });
      });

      // Step 2 & 3: Particles fly upward & settle into stars
      let startTime = null;
      const durationFly = 1600;
      const durationDraw = 1800;

      const animateSequence = (now) => {
        if (!startTime) startTime = now;
        const elapsed = now - startTime;

        if (elapsed < durationFly) {
          // Particles rising and settling
          const t = Math.min(elapsed / durationFly, 1);
          // Ease out cubic
          const ease = 1 - Math.pow(1 - t, 3);
          this.constellationParticles.forEach(p => {
            // Arc trajectory upward
            const midY = Math.min(p.startY, p.targetY) - 80;
            p.x = p.startX + (p.targetX - p.startX) * ease;
            p.y = (1 - ease) * (1 - ease) * p.startY + 2 * (1 - ease) * ease * midY + ease * ease * p.targetY;
          });
          requestAnimationFrame(animateSequence);
        } else if (elapsed < durationFly + durationDraw) {
          // Line drawing progression
          this.constellationParticles.forEach(p => {
            p.x = p.targetX;
            p.y = p.targetY;
            p.reached = true;
          });
          const drawProgress = (elapsed - durationFly) / durationDraw;
          this.constellationProgress = Math.min(drawProgress, 1);
          requestAnimationFrame(animateSequence);
        } else {
          this.constellationProgress = 1;
          this.constellationParticles.forEach(p => {
            p.x = p.targetX;
            p.y = p.targetY;
            p.reached = true;
          });
          if (onComplete) onComplete();
        }
      };

      requestAnimationFrame(animateSequence);
    }

    drawMoon() {
      // Smooth moon phase interpolation (Stage 2 transition)
      if (Math.abs(this.currentMoonPhase - this.targetMoonPhase) > 0.005) {
        this.currentMoonPhase += (this.targetMoonPhase - this.currentMoonPhase) * 0.04;
      } else {
        this.currentMoonPhase = this.targetMoonPhase;
      }

      const ctx = this.skyCtx;
      const cx = this.width / 2;
      const cy = this.height / 2;
      const r = Math.min(this.width, this.height) * 0.28;

      ctx.save();

      // Soft ambient background aura
      const aura = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, r * 2.2);
      aura.addColorStop(0, 'rgba(167, 139, 250, 0.08)');
      aura.addColorStop(0.5, 'rgba(245, 215, 127, 0.04)');
      aura.addColorStop(1, 'rgba(4, 7, 17, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Base faint moon sphere
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(14, 21, 46, 0.4)';
      ctx.fill();

      // Moon glow rim
      ctx.strokeStyle = 'rgba(245, 215, 127, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Realistic Phase rendering
      // Phase: 0..1 (0.18 = crescent, 0.5 = half, 0.8 = gibbous, 1.0 = full)
      const p = this.currentMoonPhase;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();

      const illuminatedGrad = ctx.createRadialGradient(
        cx + r * 0.2, cy - r * 0.2, r * 0.1,
        cx, cy, r
      );
      illuminatedGrad.addColorStop(0, 'rgba(255, 250, 230, 0.26)');
      illuminatedGrad.addColorStop(0.7, 'rgba(245, 215, 127, 0.18)');
      illuminatedGrad.addColorStop(1, 'rgba(167, 139, 250, 0.12)');

      ctx.fillStyle = illuminatedGrad;

      // Draw lit moon phase hemisphere/crescent
      ctx.beginPath();
      // Right illuminated arc
      ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, false);

      // Inner terminator curve
      // For p < 0.5, terminator curves inward to the right (crescent)
      // For p == 0.5, terminator is straight line
      // For p > 0.5, terminator curves to the left (gibbous)
      const k = (p - 0.5) * 2; // -1 to 1
      ctx.ellipse(cx, cy, Math.abs(k) * r, r, 0, Math.PI / 2, -Math.PI / 2, k < 0);
      ctx.fill();

      // Extra soft inner glow for full moon
      if (p > 0.85) {
        ctx.fillStyle = `rgba(245, 215, 127, ${(p - 0.85) * 0.3})`;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.9, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      ctx.restore();
    }

    loop() {
      // 1. Render Sky & Stars
      const sCtx = this.skyCtx;
      sCtx.clearRect(0, 0, this.width, this.height);

      // Deep sky gradient
      const bgGrad = sCtx.createRadialGradient(
        this.width / 2, this.height * 0.4, 10,
        this.width / 2, this.height * 0.5, Math.max(this.width, this.height) * 0.85
      );
      bgGrad.addColorStop(0, '#0c1328');
      bgGrad.addColorStop(0.6, '#060a17');
      bgGrad.addColorStop(1, '#040711');
      sCtx.fillStyle = bgGrad;
      sCtx.fillRect(0, 0, this.width, this.height);

      // Render Moon
      this.drawMoon();

      // Render drifting stars
      for (let i = 0; i < this.stars.length; i++) {
        const s = this.stars[i];
        s.phase += s.twinkleSpeed;
        const currentAlpha = s.baseAlpha + Math.sin(s.phase) * 0.25;

        if (!this.prefersReducedMotion) {
          s.x += s.driftX;
          s.y += s.driftY;
          if (s.y < 0) s.y = this.height;
          if (s.x < 0) s.x = this.width;
          if (s.x > this.width) s.x = 0;
        }

        sCtx.beginPath();
        sCtx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        sCtx.fillStyle = s.color;
        sCtx.globalAlpha = Math.max(0.1, Math.min(1, currentAlpha));
        sCtx.fill();
      }
      sCtx.globalAlpha = 1.0;

      // 2. Render Particle Effects
      const pCtx = this.partCtx;
      pCtx.clearRect(0, 0, this.width, this.height);

      // Dissolve particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.life--;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.alpha = p.life / p.maxLife;

        if (p.life <= 0) {
          this.particles.splice(i, 1);
          continue;
        }

        pCtx.save();
        pCtx.globalAlpha = p.alpha;
        pCtx.fillStyle = p.color;
        pCtx.shadowColor = p.color;
        pCtx.shadowBlur = 8;
        pCtx.beginPath();
        pCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        pCtx.fill();
        pCtx.restore();
      }

      // Constellation Finale rendering
      if (this.isConstellationMode && this.constellationParticles.length > 0) {
        // Draw constellation lines
        const maxEdgeIdx = Math.floor(CONSTELLATION_EDGES.length * this.constellationProgress);
        pCtx.save();
        pCtx.strokeStyle = 'rgba(245, 215, 127, 0.45)';
        pCtx.lineWidth = 1.2;
        pCtx.shadowColor = '#f5d77f';
        pCtx.shadowBlur = 10;

        for (let i = 0; i < maxEdgeIdx; i++) {
          const [u, v] = CONSTELLATION_EDGES[i];
          const nodeU = this.constellationParticles[u];
          const nodeV = this.constellationParticles[v];
          if (nodeU && nodeV) {
            pCtx.beginPath();
            pCtx.moveTo(nodeU.x, nodeU.y);
            pCtx.lineTo(nodeV.x, nodeV.y);
            pCtx.stroke();
          }
        }

        // Draw active connecting line fragment
        if (maxEdgeIdx < CONSTELLATION_EDGES.length && this.constellationProgress > 0) {
          const [u, v] = CONSTELLATION_EDGES[maxEdgeIdx];
          const nodeU = this.constellationParticles[u];
          const nodeV = this.constellationParticles[v];
          const subProgress = (this.constellationProgress * CONSTELLATION_EDGES.length) - maxEdgeIdx;
          if (nodeU && nodeV) {
            pCtx.beginPath();
            pCtx.moveTo(nodeU.x, nodeU.y);
            pCtx.lineTo(
              nodeU.x + (nodeV.x - nodeU.x) * subProgress,
              nodeU.y + (nodeV.y - nodeU.y) * subProgress
            );
            pCtx.stroke();
          }
        }
        pCtx.restore();

        // Draw settled constellation star nodes
        this.constellationParticles.forEach(p => {
          pCtx.save();
          pCtx.fillStyle = '#f8fafc';
          pCtx.shadowColor = '#f5d77f';
          pCtx.shadowBlur = 14;
          pCtx.beginPath();
          pCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          pCtx.fill();

          // Outer ring sparkle
          pCtx.strokeStyle = 'rgba(245, 215, 127, 0.7)';
          pCtx.lineWidth = 0.8;
          pCtx.beginPath();
          pCtx.arc(p.x, p.y, p.size + 3, 0, Math.PI * 2);
          pCtx.stroke();
          pCtx.restore();
        });
      }

      requestAnimationFrame(this.loop);
    }
  }

  /* ==========================================================================
     3. Game State & Interaction Controller
     ========================================================================== */
  class CelestialGame {
    constructor() {
      this.skyEngine = new SkyEngine();

      // DOM Elements
      this.homeScreen = document.getElementById('home-screen');
      this.gameScreen = document.getElementById('game-screen');
      this.board = document.getElementById('board');
      
      // HUD Elements
      this.hudStageMoon = document.getElementById('hud-stage-moon');
      this.hudStageTitle = document.getElementById('hud-stage-title');
      this.hudTimerContainer = document.getElementById('hud-timer-container');
      this.hudTimerDisplay = document.getElementById('hud-timer-display');
      this.hudStarSlots = document.querySelectorAll('#hud-stars-indicator .star-slot');

      // Modals & Overlays
      this.modalHtp = document.getElementById('modal-how-to-play');
      this.overlayStageComplete = document.getElementById('overlay-stage-complete');
      this.scCrestIcon = document.getElementById('sc-crest-icon');
      this.scHeading = document.getElementById('sc-heading');
      this.scSubline = document.getElementById('sc-subline');
      this.scStars = document.querySelectorAll('#sc-stars-row .earned-star');

      this.overlayTimeUp = document.getElementById('overlay-time-up');
      this.screenFinale = document.getElementById('screen-finale');

      // Buttons
      this.btnPlay = document.getElementById('btn-play');
      this.btnHowToPlay = document.getElementById('btn-how-to-play');
      this.btnCloseHtp = document.getElementById('btn-close-htp');
      this.btnNextStage = document.getElementById('btn-next-stage');
      this.btnTryAgain = document.getElementById('btn-try-again');
      this.btnTimeupHome = document.getElementById('btn-timeup-home');
      this.btnPlayAgain = document.getElementById('btn-play-again');
      this.btnFinaleHome = document.getElementById('btn-finale-home');

      // Game Play State
      this.currentStageIndex = 0;
      this.stageConfig = STAGES[0];
      this.matchedPairsCount = 0;
      this.flippedTiles = []; // Max 2 tiles
      this.isInputLocked = false;
      this.timerInterval = null;
      this.timeRemaining = 0;
      this.hasTimerStarted = false;
      this.eclipseTimeout = null;

      this.initEventListeners();
    }

    initEventListeners() {
      // Home Screen Actions
      this.btnPlay.addEventListener('click', () => {
        this.startStage(0);
      });

      this.btnHowToPlay.addEventListener('click', () => {
        this.modalHtp.classList.remove('hidden');
      });

      this.btnCloseHtp.addEventListener('click', () => {
        this.modalHtp.classList.add('hidden');
      });

      // Stage Complete
      this.btnNextStage.addEventListener('click', () => {
        this.overlayStageComplete.classList.add('hidden');
        if (this.currentStageIndex + 1 < STAGES.length) {
          this.startStage(this.currentStageIndex + 1);
        }
      });

      // Time Up Overlay Actions
      this.btnTryAgain.addEventListener('click', () => {
        this.overlayTimeUp.classList.add('hidden');
        this.startStage(this.currentStageIndex);
      });

      this.btnTimeupHome.addEventListener('click', () => {
        this.overlayTimeUp.classList.add('hidden');
        this.showHomeScreen();
      });

      // Finale Actions
      this.btnPlayAgain.addEventListener('click', () => {
        this.screenFinale.classList.add('hidden');
        this.skyEngine.isConstellationMode = false;
        this.startStage(0);
      });

      this.btnFinaleHome.addEventListener('click', () => {
        this.screenFinale.classList.add('hidden');
        this.skyEngine.isConstellationMode = false;
        this.showHomeScreen();
      });
    }

    showHomeScreen() {
      this.stopTimer();
      clearTimeout(this.eclipseTimeout);
      this.gameScreen.classList.remove('active');
      this.overlayStageComplete.classList.add('hidden');
      this.overlayTimeUp.classList.add('hidden');
      this.screenFinale.classList.add('hidden');
      this.modalHtp.classList.add('hidden');
      this.homeScreen.classList.add('active');
      this.skyEngine.setMoonPhase(0.18, false);
      this.skyEngine.isConstellationMode = false;
    }

    startStage(stageIdx) {
      this.currentStageIndex = stageIdx;
      this.stageConfig = STAGES[stageIdx];
      this.matchedPairsCount = 0;
      this.flippedTiles = [];
      this.isInputLocked = false;
      this.hasTimerStarted = false;
      this.stopTimer();
      clearTimeout(this.eclipseTimeout);

      this.board.classList.remove('eclipse-dimmed', 'board-shimmer');

      // Update Sky Moon Phase
      this.skyEngine.setMoonPhase(this.stageConfig.moonPhase, false);
      this.skyEngine.isConstellationMode = false;

      // Update HUD
      this.hudStageMoon.textContent = this.stageConfig.icon;
      this.hudStageTitle.textContent = `${this.stageConfig.name}`;

      // Update CSS Grid dimensions on document root
      document.documentElement.style.setProperty('--cols', this.stageConfig.cols);
      document.documentElement.style.setProperty('--rows', this.stageConfig.rows);

      // Configure Timer Display
      if (this.stageConfig.timer !== null) {
        this.timeRemaining = this.stageConfig.timer;
        this.hudTimerContainer.classList.remove('hidden', 'warning');
        this.updateTimerDisplay();
      } else {
        this.hudTimerContainer.classList.add('hidden');
      }

      // Reset Live Stars Indicator
      this.updateLiveStars();

      // Switch Screens
      this.homeScreen.classList.remove('active');
      this.overlayStageComplete.classList.add('hidden');
      this.overlayTimeUp.classList.add('hidden');
      this.screenFinale.classList.add('hidden');
      this.gameScreen.classList.add('active');

      // Build & Shuffle Board
      this.buildBoard();
    }

    buildBoard() {
      this.board.innerHTML = '';

      // Prepare symbols array (each symbol appears exactly twice)
      const tileSymbols = [];
      this.stageConfig.symbols.forEach(sym => {
        tileSymbols.push(sym, sym);
      });

      // Fisher-Yates Shuffle
      for (let i = tileSymbols.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = tileSymbols[i];
        tileSymbols[i] = tileSymbols[j];
        tileSymbols[j] = temp;
      }

      // Generate Tile DOM Elements
      tileSymbols.forEach((symbol, index) => {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.setAttribute('role', 'gridcell');
        tile.setAttribute('tabindex', '0');
        tile.setAttribute('aria-label', 'Celestial tile face down');
        tile.dataset.index = index;
        tile.dataset.symbol = symbol;

        tile.innerHTML = `
          <div class="tile-inner">
            <div class="tile-back">
              ${TILE_BACK_SVG}
              <span class="tile-back-center-star">✦</span>
            </div>
            <div class="tile-front">
              <span class="tile-symbol">${symbol}</span>
            </div>
          </div>
        `;

        tile.addEventListener('click', (e) => this.handleTileClick(tile, e));
        this.board.appendChild(tile);
      });
    }

    handleTileClick(tile, event) {
      if (event) event.preventDefault();

      // Guard checks:
      // 1. Input locked during mismatch delay
      // 2. Tile already flipped or already matched
      // 3. Tile already in current pair selection
      if (this.isInputLocked) return;
      if (tile.classList.contains('flipped') || tile.classList.contains('dissolved')) return;
      if (this.flippedTiles.length >= 2) return;

      // Start timer on FIRST tile flip
      if (!this.hasTimerStarted && this.stageConfig.timer !== null) {
        this.startTimer();
      }

      // Flip tile
      tile.classList.add('flipped');
      this.flippedTiles.push(tile);

      // Stage 4 & 5 Eclipse Mechanic:
      // When player flips a 🌑 Eclipse tile, dim all other tiles for 2.0s
      if (this.stageConfig.hasEclipse && tile.dataset.symbol === '🌑') {
        this.triggerEclipseEffect();
      }

      // If two tiles are flipped, compare
      if (this.flippedTiles.length === 2) {
        this.checkMatch();
      }
    }

    triggerEclipseEffect() {
      this.board.classList.add('eclipse-dimmed');
      clearTimeout(this.eclipseTimeout);
      this.eclipseTimeout = setTimeout(() => {
        this.board.classList.remove('eclipse-dimmed');
      }, 2000);
    }

    checkMatch() {
      const [tile1, tile2] = this.flippedTiles;
      const isMatch = tile1.dataset.symbol === tile2.dataset.symbol;

      if (isMatch) {
        // Successful Match
        this.handleMatchSuccess(tile1, tile2);
      } else {
        // Mismatch: Lock input, show for 0.8s, then flip back
        this.isInputLocked = true;
        setTimeout(() => {
          tile1.classList.remove('flipped');
          tile2.classList.remove('flipped');
          this.flippedTiles = [];
          this.isInputLocked = false;
        }, 800);
      }
    }

    handleMatchSuccess(tile1, tile2) {
      this.matchedPairsCount++;
      this.isInputLocked = true; // Briefly prevent clicks during dissolve

      // Stage 2 Shimmer: after every 3rd successful match (3rd and 6th)
      if (this.stageConfig.hasShimmer && (this.matchedPairsCount % 3 === 0)) {
        this.board.classList.add('board-shimmer');
        setTimeout(() => {
          this.board.classList.remove('board-shimmer');
        }, 500);
      }

      // Physical drift effect: compute vector towards each other
      const rect1 = tile1.getBoundingClientRect();
      const rect2 = tile2.getBoundingClientRect();
      const dx = (rect2.left - rect1.left) * 0.12;
      const dy = (rect2.top - rect1.top) * 0.12;

      tile1.classList.add('matching');
      tile2.classList.add('matching');

      const inner1 = tile1.querySelector('.tile-inner');
      const inner2 = tile2.querySelector('.tile-inner');
      if (inner1) inner1.style.transform = `rotateY(180deg) translate(${dx}px, ${dy}px)`;
      if (inner2) inner2.style.transform = `rotateY(180deg) translate(${-dx}px, ${-dy}px)`;

      // Particle dissolve emission at tile centers
      const center1 = { x: rect1.left + rect1.width / 2, y: rect1.top + rect1.height / 2 };
      const center2 = { x: rect2.left + rect2.width / 2, y: rect2.top + rect2.height / 2 };
      this.skyEngine.emitDissolveParticles(center1.x, center1.y, tile1.dataset.symbol);
      this.skyEngine.emitDissolveParticles(center2.x, center2.y, tile2.dataset.symbol);

      // Check if this is the final match of the stage
      const isStageWon = this.matchedPairsCount === this.stageConfig.pairs;

      setTimeout(() => {
        tile1.classList.add('dissolved');
        tile2.classList.add('dissolved');
        tile1.classList.remove('matching');
        tile2.classList.remove('matching');
        if (inner1) inner1.style.transform = '';
        if (inner2) inner2.style.transform = '';

        this.flippedTiles = [];
        this.isInputLocked = false;

        if (isStageWon) {
          this.handleStageComplete(tile1, tile2);
        }
      }, 350);
    }

    startTimer() {
      this.hasTimerStarted = true;
      this.stopTimer();

      this.timerInterval = setInterval(() => {
        this.timeRemaining--;
        this.updateTimerDisplay();
        this.updateLiveStars();

        if (this.timeRemaining <= 15) {
          this.hudTimerContainer.classList.add('warning');
        }

        if (this.timeRemaining <= 0) {
          this.stopTimer();
          this.handleTimeUp();
        }
      }, 1000);
    }

    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    }

    updateTimerDisplay() {
      const minutes = Math.floor(Math.max(0, this.timeRemaining) / 60);
      const seconds = Math.max(0, this.timeRemaining) % 60;
      const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      this.hudTimerDisplay.textContent = formatted;
    }

    getEarnedStars() {
      // Stages 1 and 2: always 3 stars
      if (this.stageConfig.timer === null) {
        return 3;
      }
      // Stages 3 to 5: based on time remaining ratio
      const ratio = this.timeRemaining / this.stageConfig.timer;
      if (ratio >= 0.50) return 3;
      if (ratio >= 0.25) return 2;
      return 1;
    }

    updateLiveStars() {
      const stars = this.getEarnedStars();
      this.hudStarSlots.forEach((slot, index) => {
        if (index < stars) {
          slot.classList.add('star-active');
        } else {
          slot.classList.remove('star-active');
        }
      });
    }

    handleTimeUp() {
      this.isInputLocked = true;
      // Fade screen slowly over ~1.5s to near-black
      this.overlayTimeUp.classList.remove('hidden');
    }

    handleStageComplete(finalTileA, finalTileB) {
      this.stopTimer();
      clearTimeout(this.eclipseTimeout);

      if (this.stageConfig.isFinal) {
        // Stage 5 Constellation Finale Sequence
        this.isInputLocked = true;
        this.skyEngine.startConstellationFinale(finalTileA, finalTileB, () => {
          setTimeout(() => {
            this.screenFinale.classList.remove('hidden');
          }, 400);
        });
        return;
      }

      // Stage 2 Completion: Moon animates smoothly from 🌒 to 🌓
      if (this.stageConfig.stageNum === 2) {
        this.skyEngine.setMoonPhase(0.5, true);
      }

      // Calculate Stars
      const starsEarned = this.getEarnedStars();

      // Show Stage Complete Overlay
      this.scCrestIcon.textContent = this.stageConfig.icon;
      this.scHeading.textContent = this.stageConfig.completeHeading;
      this.scSubline.textContent = this.stageConfig.completeSubline;

      // Animate stars reveal
      this.scStars.forEach(s => s.classList.remove('revealed'));
      this.overlayStageComplete.classList.remove('hidden');

      for (let i = 0; i < starsEarned; i++) {
        setTimeout(() => {
          if (this.scStars[i]) {
            this.scStars[i].classList.add('revealed');
          }
        }, 300 + i * 220);
      }
    }
  }

  // Initialize Game on DOM ready
  window.addEventListener('DOMContentLoaded', () => {
    new CelestialGame();
  });

})();
