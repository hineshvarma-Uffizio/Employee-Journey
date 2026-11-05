/* ==========================================================================
   AMBIENT DUST & CELEBRATION CONFETTI PARTICLE ENGINES
   ========================================================================== */
    /* ==========================================================================
       2. AMBIENT PARTICLES
       ========================================================================== */
    const ambientCanvas = document.getElementById('ambientCanvas');
    const actx = ambientCanvas.getContext('2d');
    let particles = [];

    function resizeCanvas() {
      ambientCanvas.width = window.innerWidth;
      ambientCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2; // Uneven multidirectional (any angle 0-360 deg)
      const speed = Math.random() * 0.10 + 0.04; // Very slow, gentle ambient drift (0.04 to 0.14 px/frame)
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2.0 + 0.7,
        speed: speed,
        angle: angle,
        wobble: (Math.random() - 0.5) * 0.008, // Subtle organic meandering curve
        baseAlpha: Math.random() * 0.45 + 0.2,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.015 + 0.008
      });
    }

    function renderAmbient() {
      actx.clearRect(0, 0, ambientCanvas.width, ambientCanvas.height);
      actx.fillStyle = '#f5c065';
      const w = ambientCanvas.width;
      const h = ambientCanvas.height;

      particles.forEach(p => {
        p.angle += p.wobble;
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;

        // Uneven wrap-around on all 4 borders (top, bottom, left, right)
        if (p.x < -15) p.x = w + 15;
        else if (p.x > w + 15) p.x = -15;

        if (p.y < -15) p.y = h + 15;
        else if (p.y > h + 15) p.y = -15;

        p.pulse += p.pulseSpeed;
        const currentAlpha = Math.max(0.15, Math.min(0.85, p.baseAlpha + Math.sin(p.pulse) * 0.2));

        actx.globalAlpha = currentAlpha;
        actx.beginPath();
        actx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        actx.fill();
      });
      requestAnimationFrame(renderAmbient);
    }
    renderAmbient();


    // Fullscreen Confetti Particle System
    const confettiCanvas = document.getElementById('confettiCanvas');
    const cctx = confettiCanvas.getContext('2d');
    let confettiPieces = [];

    function resizeConfetti() {
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeConfetti);
    resizeConfetti();

    function fireConfetti() {
      palaceAudio.init();
      palaceAudio.playChime();

      const colors = ['#f5c065', '#ffd700', '#00e5ff', '#ff4d6d', '#10b981', '#ffffff', '#f43f5e', '#c084fc', '#fb923c'];
      const totalPieces = 300;
      for (let i = 0; i < totalPieces; i++) {
        // Delicate smaller festive confetti pieces
        const rand = Math.random();
        let shape = 'rect';
        let width = 0, height = 0, radius = 0, size = 0;

        if (rand < 0.35) {
          shape = 'rect'; // Varied smaller rectangles
          width = Math.random() * 5 + 4; // 4px to 9px
          height = Math.random() * 3.5 + 2.5; // 2.5px to 6px
        } else if (rand < 0.60) {
          shape = 'strip'; // Smaller ribbon strips
          width = Math.random() * 7 + 7; // 7px to 14px
          height = Math.random() * 1.8 + 1.8; // 1.8px to 3.6px
        } else if (rand < 0.80) {
          shape = 'circle'; // Small round sequins / dots
          radius = Math.random() * 1.8 + 1.6; // 1.6px to 3.4px radius
        } else if (rand < 0.90) {
          shape = 'diamond'; // Small diamond gems
          size = Math.random() * 3 + 3.2; // 3.2px to 6.2px
        } else {
          shape = 'star'; // Small 4-pointed sparkle stars
          size = Math.random() * 3 + 3.2; // 3.2px to 6.2px
        }

        // Center explosive burst: all confetti blasts directly from the center
        const originX = window.innerWidth * 0.5 + (Math.random() - 0.5) * 60;
        const originY = window.innerHeight * 0.65;
        const vx = (Math.random() - 0.5) * 58;
        const vy = -Math.random() * 32 - 28;

        confettiPieces.push({
          x: originX,
          y: originY,
          vx: vx,
          vy: vy,
          shape: shape,
          width: width,
          height: height,
          radius: radius,
          size: size,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 48,
          wobble: Math.random() * 10,
          wobbleSpeed: Math.random() * 0.32 + 0.18,
          gravity: Math.random() * 0.35 + 1.25,
          life: 1
        });
      }
    }
    const btnFireConfettiEl = document.getElementById('btnFireConfetti');
    if (btnFireConfettiEl) btnFireConfettiEl.addEventListener('click', fireConfetti);

    function renderConfetti() {
      cctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      for (let i = confettiPieces.length - 1; i >= 0; i--) {
        const p = confettiPieces[i];
        p.vy += p.gravity;
        p.vx *= 0.988;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.wobble += p.wobbleSpeed;
        p.life -= 0.015;

        if (p.life <= 0 || p.y > confettiCanvas.height + 30) {
          confettiPieces.splice(i, 1);
          continue;
        }

        cctx.save();
        cctx.translate(p.x, p.y);
        cctx.rotate((p.rotation * Math.PI) / 180);
        // 3D flip flutter effect: compresses horizontally to simulate realistic tumbling paper
        cctx.scale(Math.cos(p.wobble), 1);
        cctx.globalAlpha = Math.max(0, p.life);
        cctx.fillStyle = p.color;

        if (p.shape === 'circle') {
          cctx.beginPath();
          cctx.arc(0, 0, p.radius, 0, Math.PI * 2);
          cctx.fill();
        } else if (p.shape === 'diamond') {
          cctx.beginPath();
          cctx.moveTo(0, -p.size);
          cctx.lineTo(p.size * 0.7, 0);
          cctx.lineTo(0, p.size);
          cctx.lineTo(-p.size * 0.7, 0);
          cctx.closePath();
          cctx.fill();
        } else if (p.shape === 'star') {
          cctx.beginPath();
          const s = p.size;
          cctx.moveTo(0, -s);
          cctx.quadraticCurveTo(0, 0, s, 0);
          cctx.quadraticCurveTo(0, 0, 0, s);
          cctx.quadraticCurveTo(0, 0, -s, 0);
          cctx.quadraticCurveTo(0, 0, 0, -s);
          cctx.closePath();
          cctx.fill();
        } else {
          // 'rect' and 'strip'
          cctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        }

        cctx.restore();
      }
      requestAnimationFrame(renderConfetti);
    }
    renderConfetti();


// Export particle functions
window.resizeCanvas = resizeCanvas;
window.renderAmbient = renderAmbient;
window.resizeConfetti = resizeConfetti;
window.fireConfetti = fireConfetti;
