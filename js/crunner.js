// runner.js — chrome dino–style gate game (retro-skinned)
// requires: a scratch cat PNG at: assets/cat.png  (adjust path below if needed)

(() => {
  const STATE = {
    running: false,
    over: false,
    muted: false,
    score: 0,
    high: 0,
    speed: 6,           // world speed (pixels / frame)
    gravity: 0.8,
    jumpVel: -12.5,
    maxSpeed: 14,
    spawnMin: 60,       // min frames between spikes
    spawnMax: 110,      // max frames between spikes
    target: 300,
    sessionKey: "runner_gate_cleared"
  };

  const IMG = new Image();
  IMG.src = "assets/images/scratch_cat.png"; // <-- put your Scratch Cat PNG here

  // DOM
  const gate = document.getElementById("gameGate");
  const canvas = document.getElementById("runner");
  const scoreVal = document.getElementById("scoreVal");
  const resetBtn = document.getElementById("resetBtn");
  const muteBtn = document.getElementById("muteBtn"); // hidden (no audio)
  const playAgainBtn = document.getElementById("playAgainBtn");
  if (!canvas || !gate) return;

  const ctx = canvas.getContext("2d");
  let W = canvas.width, H = canvas.height;
  const groundY = Math.round(H * 0.8);
  let frame = 0, spawnIn = 90;
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
    STATE.running = true;
    STATE.over = false;
    STATE.reachedTarget = STATE.reachedTarget; // keep target status if replay
    if (full) STATE.score = 0;
    STATE.speed = 6;
    frame = 0;
    spawnIn = 90;
    obstacles = [];
    clouds = [];
    player.y = groundY - player.h;
    player.vy = 0;
    player.onGround = true;
    scoreVal.textContent = "0";
    scoreVal.style.color = "#00ff66";

    for (let i = 0; i < 3; i++) {
      clouds.push({ x: Math.random() * W, y: 30 + Math.random() * 60, s: 0.2 + Math.random() * 0.6 });
    }
  }

  function unlockSite() {
    sessionStorage.setItem(STATE.sessionKey, "1");
    gate.classList.add("hidden");
  }

  function ensureGateVisibility() {
    const cleared = sessionStorage.getItem(STATE.sessionKey) === "1";
    if (cleared) {
      gate.classList.add("hidden");
    } else {
      gate.classList.remove("hidden");
      reset();
      requestAnimationFrame(loop);
    }
  }

  // Controls
  function doJump() {
    if (!STATE.running || STATE.over) return;
    if (player.onGround) {
      player.vy = STATE.jumpVel;
      player.onGround = false;
    }
  }

  function onKey(e) {
    if (e.code === "Space" || e.code === "ArrowUp") {
      e.preventDefault();
      doJump();
    } else if (e.code === "Enter" && STATE.over && !STATE.reachedTarget) {
      reset();
    } else if (e.code === "KeyR" && STATE.over && STATE.reachedTarget) {
      reset();
    }
  }

  function onPointer() {
    if (STATE.over && STATE.reachedTarget) {
      reset();
      return;
    } else if (STATE.over) {
      reset();
      return;
    }
    doJump();
  }

  // Spawn
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

  function aabbCollision(ax, ay, aw, ah, bx, by, bw, bh) {
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

      if (STATE.score >= STATE.target && !STATE.reachedTarget) {
        STATE.reachedTarget = true;
        scoreVal.style.color = "gold";
        unlockSite(); // unlock site only once
      }
    }

    for (const o of obstacles) {
      const px = player.x + 6, pw = player.w - 12;
      const py = player.y + 6 + player.bob, ph = player.h - 10;
      const sx = o.x, sy = o.y - o.h, sw = o.w, sh = o.h;
      if (aabbCollision(px, py, pw, ph, sx, sy, sw, sh)) {
        STATE.over = true;
        STATE.running = false;
      }
    }
  }

  // Draw
  function drawGround() {
    ctx.fillStyle = "#00ff66";
    ctx.fillRect(0, groundY + 1, W, 2);
    const dashGap = 18, dashW = 10, y = groundY + 10;
    for (let x = -((frame * STATE.speed) % (dashGap + dashW)); x < W; x += (dashGap + dashW)) {
      ctx.fillRect(x, y, dashW, 2);
    }
  }

  function drawCloud(x, y) {
    ctx.fillStyle = "#00ff66";
    ctx.fillRect(x, y, 18, 4);
    ctx.fillRect(x - 6, y + 4, 30, 4);
    ctx.fillRect(x - 12, y + 8, 44, 4);
  }

  function drawSpike(o) {
    ctx.fillStyle = "#00ff66";
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
      ctx.fillStyle = "#00ff66";
      ctx.fillRect(player.x, player.y + bobY, player.w, player.h);
    }
  }

  function draw() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);

    clouds.forEach(c => drawCloud(c.x, c.y));
    drawGround();
    obstacles.forEach(drawSpike);
    drawPlayer();

    // Show prompts
    ctx.font = "14px 'Press Start 2P', monospace";
    ctx.fillStyle = "#00ff66";
    if (STATE.over && !STATE.reachedTarget) {
      const msg = "Ouch! Press Enter / Tap to retry";
      const tw = ctx.measureText(msg).width;
      ctx.fillText(msg, (W - tw) / 2, H * 0.42);
    } else if (STATE.over && STATE.reachedTarget) {
      const msg = "You made it! Press R / Tap to play again";
      const tw = ctx.measureText(msg).width;
      ctx.fillStyle = "gold";
      ctx.fillText(msg, (W - tw) / 2, H * 0.42);
    } else if (!STATE.running && !STATE.over) {
      const m = "Tap / Space / ↑ to start";
      const tw = ctx.measureText(m).width;
      ctx.fillText(m, (W - tw) / 2, H * 0.42);
    }
  }

  function loop() {
    if (STATE.running) update();
    draw();
    requestAnimationFrame(loop);
  }

  // Resize
  function resizeCanvas() {
    const wrap = canvas.parentElement;
    const maxW = Math.min(wrap.clientWidth, 900);
    const aspect = 800 / 240;
    const targetW = Math.floor(maxW);
    const targetH = Math.floor(targetW / aspect);
    canvas.style.width = `${targetW}px`;
    canvas.style.height = `${targetH}px`;
  }

  // Events
  window.addEventListener("keydown", onKey);
  canvas.addEventListener("pointerdown", onPointer, { passive: true });
  resetBtn?.addEventListener("click", () => reset());
  if (muteBtn) muteBtn.style.display = "none";

  playAgainBtn?.addEventListener("click", () => {
    gate.classList.remove("hidden");
    reset();
    requestAnimationFrame(loop);
  });

  ensureGateVisibility();
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
})();