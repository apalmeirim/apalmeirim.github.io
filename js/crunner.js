(() => {
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
    loopId: null
  };

  const IMG = new Image();
  IMG.src = "assets/images/scratch_cat.png";

  const gate = document.getElementById("gameGate");
  const canvas = document.getElementById("runner");
  const scoreVal = document.getElementById("scoreVal");
  const resetBtn = document.getElementById("resetBtn");
  const closeBtn = document.getElementById("closeGameBtn");
  const playBtn = document.getElementById("playGameBtn");

  if (!gate || !canvas || !scoreVal || !playBtn) return;

  const ctx = canvas.getContext("2d");

  function getThemeColors() {
    const root = getComputedStyle(document.body);
    return {
      bg: root.getPropertyValue("--panel-bg").trim(),
      text: root.getPropertyValue("--text-color").trim(),
      mint: root.getPropertyValue("--mint").trim(),
      mintLight: root.getPropertyValue("--mint-light").trim(),
      mintGlow: root.getPropertyValue("--mint-glow").trim(),
      orange: root.getPropertyValue("--orange").trim(),
      orangeLight: root.getPropertyValue("--orange-light").trim()
    };
  }

  let theme = getThemeColors();
  const observer = new MutationObserver(() => {
    theme = getThemeColors();
  });
  observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

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
    bob: 0
  };

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
    scoreVal.textContent = STATE.score.toString();
    scoreVal.style.color = theme.mint;
    for (let i = 0; i < 3; i++) {
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

  function onKey(e) {
    if (e.code === "Space" || e.code === "ArrowUp") {
      e.preventDefault();
      if (STATE.over) {
        reset();
      } else {
        doJump();
      }
    } else if (e.code === "Enter" || e.code === "KeyR") {
      if (STATE.over) {
        e.preventDefault();
        reset();
      }
    } else if (e.code === "Escape") {
      e.preventDefault();
      closeGame();
    }
  }

  function onPointer() {
    if (!STATE.active) return;
    if (STATE.over) {
      reset();
      return;
    }
    doJump();
  }

  function spawnSpike() {
    const base = 20 + Math.random() * 14;
    const height = 26 + Math.random() * 10;
    obstacles.push({ x: W + 10, y: groundY, w: base, h: height });
  }

  function spawnCloudMaybe() {
    if (Math.random() < 0.02) {
      clouds.push({ x: W + 10, y: 20 + Math.random() * 80, s: 0.2 + Math.random() * 0.6 });
    }
  }

  function aabb(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  function update() {
    frame++;
    STATE.speed = Math.min(STATE.maxSpeed, 6 + STATE.score * 0.01);
    spawnIn--;
    if (spawnIn <= 0) {
      spawnSpike();
      spawnIn = Math.floor(STATE.spawnMin + Math.random() * (STATE.spawnMax - STATE.spawnMin));
    }
    spawnCloudMaybe();
    clouds.forEach(c => (c.x -= c.s * STATE.speed * 0.5));
    clouds = clouds.filter(c => c.x > -80);
    obstacles.forEach(o => (o.x -= STATE.speed));
    obstacles = obstacles.filter(o => o.x + o.w > -10);

    player.vy += STATE.gravity;
    player.y += player.vy;
    if (player.y >= groundY - player.h) {
      player.y = groundY - player.h;
      player.vy = 0;
      player.onGround = true;
    }

    player.bob = player.onGround ? Math.sin(frame * 0.35) * 2 : 0;

    if (frame % 3 === 0) {
      STATE.score++;
      scoreVal.textContent = STATE.score.toString();
    }

    for (const o of obstacles) {
      const px = player.x + 6;
      const pw = player.w - 12;
      const py = player.y + 6 + player.bob;
      const ph = player.h - 10;
      const sx = o.x;
      const sy = o.y - o.h;
      const sw = o.w;
      const sh = o.h;
      if (aabb(px, py, pw, ph, sx, sy, sw, sh)) {
        STATE.over = true;
        STATE.running = false;
        scoreVal.style.color = theme.orange;
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
      ctx.fillStyle = "#7ab69d";
      ctx.fillRect(player.x, player.y + bobY, player.w, player.h);
    }
  }

  function draw() {
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, W, H);

    clouds.forEach(c => drawCloud(c.x, c.y));
    drawGround();
    obstacles.forEach(drawSpike);
    drawPlayer();

    ctx.font = "14px 'Press Start 2P', monospace";
    ctx.textBaseline = "top";
    ctx.textAlign = "center";
    ctx.fillStyle = theme.text;

    if (STATE.over) {
      ctx.fillText("ouch! press R, Enter, or tap to try again", W / 2, H * 0.42);
    } else if (!STATE.running) {
      ctx.fillStyle = theme.mint;
      ctx.fillText("tap / space / ↑ to start", W / 2, H * 0.42);
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
    window.addEventListener("keydown", onKey);
  }

  function detachGameKeys() {
    window.removeEventListener("keydown", onKey);
  }

  function openGame() {
    if (STATE.active) return;
    STATE.active = true;
    gate.classList.remove("hidden");
    gate.setAttribute("aria-hidden", "false");
    attachGameKeys();
    resizeCanvas();
    reset(true);
  }

  function closeGame() {
    if (!STATE.active) return;
    STATE.active = false;
    gate.classList.add("hidden");
    gate.setAttribute("aria-hidden", "true");
    detachGameKeys();
    cancelAnimationFrame(STATE.loopId);
    STATE.loopId = null;
  }

  playBtn.addEventListener("click", openGame);
  resetBtn?.addEventListener("click", () => reset(true));
  closeBtn?.addEventListener("click", closeGame);
  canvas.addEventListener("pointerdown", onPointer, { passive: true });
  window.addEventListener("resize", () => {
    if (STATE.active) resizeCanvas();
  });
})();