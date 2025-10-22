// crunner.js — Final polished version (fixes speed glitch + persistent unlock)

(() => {
  const STATE = {
    running: false,
    over: false,
    score: 0,
    speed: 6,
    gravity: 0.8,
    jumpVel: -13,
    maxSpeed: 14,
    spawnMin: 60,
    spawnMax: 110,
    target: 300,
    reachedTarget: false,
    unlocked: false,
    loopId: null,
    sessionKey: "runner_gate_cleared"
  };

  const IMG = new Image();
  IMG.src = "assets/images/scratch_cat.png";

  const gate = document.getElementById("gameGate");
  const canvas = document.getElementById("runner");
  const scoreVal = document.getElementById("scoreVal");
  const resetBtn = document.getElementById("resetBtn");
  const muteBtn = document.getElementById("muteBtn");
  const playAgainBtn = document.getElementById("playAgainBtn");
  if (!canvas || !gate) return;

  const ctx = canvas.getContext("2d");
  let W = canvas.width, H = canvas.height;
  const groundY = Math.round(H * 0.8);

  let frame = 0, spawnIn = 90;
  let obstacles = [], clouds = [];
  let goalFlashTime = 0;

  const player = {
    x: Math.round(W * 0.12),
    y: groundY - 40,
    w: 44,
    h: 40,
    vy: 0,
    onGround: true,
    bob: 0
  };

  function loadUnlockState() {
    STATE.unlocked = sessionStorage.getItem(STATE.sessionKey) === "1";
    if (STATE.unlocked) {
      STATE.reachedTarget = true;
      scoreVal.style.color = "#f6c76a";
    }
  }

  function saveUnlock() {
    STATE.unlocked = true;
    STATE.reachedTarget = true;
    sessionStorage.setItem(STATE.sessionKey, "1");
  }

  function reset(full = true) {
    cancelAnimationFrame(STATE.loopId);
    STATE.running = true;
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
    if (STATE.unlocked) {
    scoreVal.style.color = "#f6c76a"; // gold color if unlocked
    } else {
    scoreVal.style.color = "#7ab69d"; // default green
    }
    for (let i = 0; i < 3; i++) {
      clouds.push({ x: Math.random() * W, y: 30 + Math.random() * 60, s: 0.2 + Math.random() * 0.6 });
    }
    loop();
  }

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
    } else if (e.code === "Enter" && STATE.over) {
    if (STATE.unlocked) {
        // Player has beaten the game → Enter always skips
        gate.classList.add("hidden");
    } else {
        // Player hasn’t beaten 300 yet → restart instead
        reset();
    }
    e.preventDefault();
    }

    else if (e.code === "KeyR" && STATE.over) {
    // Always restart the game
    e.preventDefault();
    reset();
    }
  }

  function onPointer() {
    if (STATE.over) { reset(); return; }
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
      if (STATE.score >= STATE.target && !STATE.reachedTarget) {
        STATE.reachedTarget = true;
        saveUnlock();
        scoreVal.style.color = "#f6c76a";
        goalFlashTime = 1000; // show for 1 second
    }   
    }

    for (const o of obstacles) {
      const px = player.x + 6, pw = player.w - 12;
      const py = player.y + 6 + player.bob, ph = player.h - 10;
      const sx = o.x, sy = o.y - o.h, sw = o.w, sh = o.h;
      if (aabb(px, py, pw, ph, sx, sy, sw, sh)) {
        STATE.over = true;
        STATE.running = false;
      }
    }
  }

  /* Drawing functions with pastel palette */
  function drawGround() {
    ctx.fillStyle = "#7ab69d";
    ctx.fillRect(0, groundY + 1, W, 2);
    const dashGap = 18, dashW = 10, y = groundY + 10;
    for (let x = -((frame * STATE.speed) % (dashGap + dashW)); x < W; x += dashGap + dashW) {
      ctx.fillRect(x, y, dashW, 2);
    }
  }

  function drawCloud(x, y) {
    ctx.fillStyle = "#b6e2d3";
    ctx.fillRect(x, y, 18, 4);
    ctx.fillRect(x - 6, y + 4, 30, 4);
    ctx.fillRect(x - 12, y + 8, 44, 4);
  }

  function drawSpike(o) {
    ctx.fillStyle = "#94c9b1";
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
    ctx.fillStyle = "#fdfdfd";
    ctx.fillRect(0, 0, W, H);

    clouds.forEach(c => drawCloud(c.x, c.y));
    drawGround();
    obstacles.forEach(drawSpike);
    drawPlayer();

    ctx.font = "14px 'Press Start 2P', monospace";
    ctx.textBaseline = "top";
    ctx.textAlign = "center";

    if (STATE.over) {
        if (STATE.unlocked) {
            // Player has beaten the game before
            ctx.fillStyle = "#f6c76a";
            ctx.fillText("You made it! Press R to restart or Enter to continue", W / 2, H * 0.42);
        } else {
            // Player has never reached 300
            ctx.fillStyle = "#7ab69d";
            ctx.fillText("Ouch! Press R to retry", W / 2, H * 0.42);
        }
    } else if (!STATE.running) {
      ctx.fillStyle = "#7ab69d";
      ctx.fillText("Tap / Space / ↑ to start", W / 2, H * 0.42);
    }
    if (goalFlashTime > 0) {
        ctx.fillStyle = "#f8c8a0";
        ctx.font = "16px 'Press Start 2P', monospace";
        ctx.textAlign = "center";
        ctx.fillText("GOAL REACHED!", W / 2, H * 0.35);
        goalFlashTime -= 1000 / 60; // roughly 1 second at 60 FPS
    }
  }

  function loop() {
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

  window.addEventListener("keydown", onKey);
  canvas.addEventListener("pointerdown", onPointer, { passive: true });
  resetBtn?.addEventListener("click", () => reset());
  if (muteBtn) muteBtn.style.display = "none";
  playAgainBtn?.addEventListener("click", () => { gate.classList.remove("hidden"); reset(); });

  gate.classList.remove("hidden");
    // 1. Load persistent unlock first
    loadUnlockState();

    // 2. Show gate overlay
    gate.classList.remove("hidden");

    // 3. Adjust canvas size
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // 4. Start loop safely after unlock state is known
    requestAnimationFrame(() => reset(true));
})();
