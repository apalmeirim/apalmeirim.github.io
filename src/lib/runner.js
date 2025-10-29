const IMG = new Image();
IMG.src = '/assets/images/scratch_cat.png';

const STORAGE_KEY = 'runner-high-score';

const readStoredHighScore = () => {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = window.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const value = Number.parseInt(raw, 10);
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
};

const writeStoredHighScore = (value) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage?.setItem(STORAGE_KEY, String(value));
  } catch {
    /* ignore */
  }
};

export function createRunnerGame({ canvas, scoreEl, highScoreEl, onRequestClose } = {}) {
  if (!canvas || !scoreEl) {
    return {
      open: () => {},
      close: () => {},
      reset: () => {},
      destroy: () => {},
    };
  }

  const ctx = canvas.getContext('2d');

  const STATE = {
    active: false,
    running: false,
    over: false,
    score: 0,
    speed: 6,
    gravity: 0.8,
    jumpVel: -13,
    maxSpeed: 14,
    spawnMin: 60,
    spawnMax: 110,
    loopId: null,
  };

  const getThemeColors = () => {
    const root = getComputedStyle(document.body);
    return {
      bg: root.getPropertyValue('--panel-bg').trim(),
      text: root.getPropertyValue('--text-color').trim(),
      mint: root.getPropertyValue('--mint').trim(),
      mintLight: root.getPropertyValue('--mint-light').trim(),
      mintGlow: root.getPropertyValue('--mint-glow').trim(),
      orange: root.getPropertyValue('--orange').trim(),
      orangeLight: root.getPropertyValue('--orange-light').trim(),
    };
  };

  let theme = getThemeColors();

  let W = canvas.width;
  let H = canvas.height;
  const groundY = Math.round(H * 0.8);
  let frame = 0;
  let spawnIn = 90;
  let obstacles = [];
  let clouds = [];

  const player = {
    x: Math.round(W * 0.12),
    y: groundY - 40,
    w: 44,
    h: 40,
    vy: 0,
    onGround: true,
    bob: 0,
  };

  const aabb = (ax, ay, aw, ah, bx, by, bw, bh) =>
    ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;

  let highScore = readStoredHighScore();

  const updateHighScoreDisplay = () => {
    if (highScoreEl) {
      highScoreEl.textContent = highScore.toString();
      highScoreEl.style.color = highScore > 0 ? theme.mint : theme.text;
    }
  };

  const observer = new MutationObserver(() => {
    theme = getThemeColors();
    updateHighScoreDisplay();
  });
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  function reset(full = true) {
    if (!STATE.active) return;
    cancelAnimationFrame(STATE.loopId);
    STATE.running = false;
    STATE.over = false;
    STATE.speed = 6;
    frame = 0;
    spawnIn = 90;
    obstacles = [];
    clouds = [];
    player.y = groundY - player.h;
    player.vy = 0;
    player.onGround = true;
    if (full) STATE.score = 0;
    scoreEl.textContent = STATE.score.toString();
    scoreEl.style.color = theme.mint;
    updateHighScoreDisplay();
    for (let i = 0; i < 3; i += 1) {
      clouds.push({ x: Math.random() * W, y: 30 + Math.random() * 60, s: 0.2 + Math.random() * 0.6 });
    }
    draw();
    STATE.loopId = requestAnimationFrame(loop);
  }

  function doJump() {
    if (!STATE.active) return;
    if (!STATE.running) STATE.running = true;
    if (player.onGround) {
      player.vy = STATE.jumpVel;
      player.onGround = false;
    }
  }

  const closeGame = (notify = true) => {
    if (!STATE.active) return;
    STATE.active = false;
    detachGameKeys();
    cancelAnimationFrame(STATE.loopId);
    STATE.loopId = null;
    if (notify && typeof onRequestClose === 'function') {
      onRequestClose();
    }
  };

  const onKey = (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      if (STATE.over) {
        reset();
      } else {
        doJump();
      }
    } else if (e.code === 'Enter' || e.code === 'KeyR') {
      if (STATE.over) {
        e.preventDefault();
        reset();
      }
    } else if (e.code === 'Escape') {
      e.preventDefault();
      closeGame();
    }
  };

  const onPointer = () => {
    if (!STATE.active) return;
    if (STATE.over) {
      reset();
      return;
    }
    doJump();
  };

  function spawnSpike() {
    const base = 20 + Math.random() * 14;
    const h = 34 + Math.random() * 40;
    const w = base + Math.random() * 18;
    obstacles.push({
      x: W + Math.random() * 40,
      y: groundY + 10,
      h,
      w,
    });
  }

  function spawnCloud() {
    clouds.push({
      x: W + 60,
      y: 30 + Math.random() * 60,
      s: 0.2 + Math.random() * 0.6,
    });
  }

  function update() {
    frame += 1;
    if (frame % 6 === 0) {
      player.bob = Math.sin(frame / 8) * 1.5;
    }
    if (STATE.speed < STATE.maxSpeed && frame % 240 === 0) {
      STATE.speed += 0.4;
      STATE.speed = Math.min(STATE.speed, STATE.maxSpeed);
    }
    spawnIn -= 1;
    if (spawnIn <= 0) {
      spawnSpike();
      spawnIn = Math.round(STATE.spawnMin + Math.random() * (STATE.spawnMax - STATE.spawnMin));
    }
    if (frame % 140 === 0) {
      spawnCloud();
    }
    player.vy += STATE.gravity;
    player.y += player.vy;
    if (player.y >= groundY - player.h) {
      player.y = groundY - player.h;
      player.vy = 0;
      player.onGround = true;
    }
    obstacles = obstacles
      .map((o) => ({
        ...o,
        x: o.x - STATE.speed,
      }))
      .filter((o) => o.x + o.w > -20);
    clouds = clouds
      .map((c) => ({
        ...c,
        x: c.x - c.s * STATE.speed * 0.6,
      }))
      .filter((c) => c.x > -70);
    if (STATE.running && frame % 4 === 0) {
      STATE.score += 1;
      scoreEl.textContent = STATE.score.toString();
      if (STATE.score > highScore) {
        highScore = STATE.score;
        writeStoredHighScore(highScore);
        if (highScoreEl) {
          highScoreEl.textContent = highScore.toString();
          highScoreEl.style.color = theme.mint;
        }
      }
    }
    // collision detection
    for (const o of obstacles) {
      const px = player.x + 10;
      const pw = player.w - 18;
      const py = player.y + 6 + player.bob;
      const ph = player.h - 10;
      const sx = o.x;
      const sy = o.y - o.h;
      const sw = o.w;
      const sh = o.h;
      if (aabb(px, py, pw, ph, sx, sy, sw, sh)) {
        STATE.over = true;
        STATE.running = false;
        scoreEl.style.color = theme.orange;
        updateHighScoreDisplay();
        break;
      }
    }
  }

  function drawGround() {
    ctx.fillStyle = theme.mint;
    ctx.fillRect(0, groundY + 1, W, 2);
    const dashGap = 18;
    const dashW = 10;
    const y = groundY + 10;
    for (let x = -((frame * STATE.speed) % (dashGap + dashW)); x < W; x += dashGap + dashW) {
      ctx.fillRect(x, y, dashW, 2);
    }
  }

  function drawCloud(x, y) {
    ctx.fillStyle = theme.mintLight;
    ctx.fillRect(x, y, 18, 4);
    ctx.fillRect(x - 6, y + 4, 30, 4);
    ctx.fillRect(x - 12, y + 8, 44, 4);
  }

  function drawSpike(o) {
    ctx.fillStyle = theme.mintGlow;
    ctx.beginPath();
    ctx.moveTo(o.x, o.y);
    ctx.lineTo(o.x + o.w / 2, o.y - o.h);
    ctx.lineTo(o.x + o.w, o.y);
    ctx.closePath();
    ctx.fill();
  }

  function drawPlayer() {
    const bobY = player.bob;
    if (IMG.complete && IMG.naturalWidth > 0) {
      ctx.drawImage(IMG, player.x, player.y + bobY, player.w, player.h);
    } else {
      ctx.fillStyle = '#7ab69d';
      ctx.fillRect(player.x, player.y + bobY, player.w, player.h);
    }
  }

  function draw() {
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, W, H);
    clouds.forEach((c) => drawCloud(c.x, c.y));
    drawGround();
    obstacles.forEach(drawSpike);
    drawPlayer();
    ctx.font = "14px 'Press Start 2P', monospace";
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    ctx.fillStyle = theme.text;
    if (STATE.over) {
      ctx.fillText('ouch! press R, Enter, or tap to try again', W / 2, H * 0.42);
    } else if (!STATE.running) {
      ctx.fillStyle = theme.mint;
      ctx.fillText("tap / space / cmd+` to start", W / 2, H * 0.42);
    }
  }

  function loop() {
    if (!STATE.active) return;
    if (STATE.running) update();
    draw();
    STATE.loopId = requestAnimationFrame(loop);
  }

  function resizeCanvas() {
    const wrap = canvas.parentElement;
    const maxW = Math.min(wrap.clientWidth, 900);
    const aspect = 800 / 240;
    const targetW = Math.floor(maxW);
    const targetH = Math.floor(targetW / aspect);
    canvas.style.width = `${targetW}px`;
    canvas.style.height = `${targetH}px`;
  }

  function attachGameKeys() {
    window.addEventListener('keydown', onKey);
  }

  function detachGameKeys() {
    window.removeEventListener('keydown', onKey);
  }

  const handleResize = () => {
    if (STATE.active) resizeCanvas();
  };

  canvas.addEventListener('pointerdown', onPointer, { passive: true });
  window.addEventListener('resize', handleResize);
  scoreEl.textContent = '0';
  updateHighScoreDisplay();

  return {
    open() {
      if (STATE.active) return;
      STATE.active = true;
      attachGameKeys();
      resizeCanvas();
      reset(true);
    },
    close() {
      closeGame(false);
    },
    reset: () => {
      reset(true);
    },
    destroy() {
      closeGame(false);
      observer.disconnect();
      canvas.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('resize', handleResize);
    },
  };
}
