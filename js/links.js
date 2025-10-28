// links.js - floating link blocks

const { Engine, Render, Runner, Bodies, Body, World, Mouse, MouseConstraint, Events, Query } = Matter;

const canvas = document.getElementById("world");

function computeCanvasSize() {
  const isMobile = window.innerWidth < 768; // breakpoint threshold

  if (isMobile) {
    const width = Math.min(window.innerWidth * 0.9, 400);
    const height = width * 1.2; // taller aspect for phones
    return { width: Math.round(width), height: Math.round(height) };
  } else {
    const size = Math.max(Math.min(window.innerHeight * 0.8, 520), 300);
    return { width: Math.round(size), height: Math.round(size) }; // square for desktop
  }
}

let { width: canvasWidth, height: canvasHeight } = computeCanvasSize();

function syncCanvasDimensions() {
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  canvas.style.width = `${canvasWidth}px`;
  canvas.style.height = `${canvasHeight}px`;
}

syncCanvasDimensions();

const engine = Engine.create();
const render = Render.create({
  canvas: canvas,
  engine: engine,
  options: {
    width: canvasWidth,
    height: canvasHeight,
    wireframes: false,
    background: "transparent"
  }
});
render.bounds = {
  min: { x: 0, y: 0 },
  max: { x: canvasWidth, y: canvasHeight }
};

//  120hz simulation
const runner = Runner.create({
  delta: 1000 / 120  // simulate 120 hz instead of 60 hz
});
Render.run(render);
Runner.run(runner, engine);

//  mouse drag
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
  mouse,
  constraint: { stiffness: 0.7, render: { visible: false } }
});
World.add(engine.world, mouseConstraint);

// link mouse to renderer for correct coordinates
render.mouse = mouse;

// world creation
let ground;
let leftWall;
let rightWall;
let ceiling;

function rebuildBounds() {
  if (ground) {
    World.remove(engine.world, [ground, ceiling, leftWall, rightWall]);
  }
  ground = Bodies.rectangle(canvasWidth / 2, canvasHeight + 20, canvasWidth, 40, { isStatic: true });
  leftWall = Bodies.rectangle(-20, canvasHeight / 2, 40, canvasHeight, { isStatic: true });
  rightWall = Bodies.rectangle(canvasWidth + 20, canvasHeight / 2, 40, canvasHeight, { isStatic: true });
  ceiling = Bodies.rectangle(canvasWidth / 2, -20, canvasWidth, 40, { isStatic: true });
  World.add(engine.world, [ground, ceiling, leftWall, rightWall]);
}

rebuildBounds();

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function rescaleContactBodies(scaleX, scaleY) {
  engine.world.bodies.forEach(body => {
    if (!body.contact) return;
    const halfWidth = (body.bounds.max.x - body.bounds.min.x) / 2;
    const halfHeight = (body.bounds.max.y - body.bounds.min.y) / 2;
    const newX = clamp(body.position.x * scaleX, halfWidth + 8, canvasWidth - halfWidth - 8);
    const newY = clamp(body.position.y * scaleY, halfHeight + 8, canvasHeight - halfHeight - 8);
    Body.setPosition(body, { x: newX, y: newY });
  });
}

function handleResize() {
  const prevWidth = canvasWidth;
  const prevHeight = canvasHeight;
  const { width: newW, height: newH } = computeCanvasSize();
  if (!newW || !newH || (Math.abs(newW - prevWidth) < 1 && Math.abs(newH - prevHeight) < 1)) {
    return;
  }

  const scaleX = newW / prevWidth;
  const scaleY = newH / prevHeight;

  canvasWidth = newW;
  canvasHeight = newH;

  syncCanvasDimensions();

  render.options.width = canvasWidth;
  render.options.height = canvasHeight;
  render.bounds.max.x = canvasWidth;
  render.bounds.max.y = canvasHeight;
  render.canvas.width = canvasWidth;
  render.canvas.height = canvasHeight;

  rescaleContactBodies(scaleX, scaleY);
  rebuildBounds();
}

window.addEventListener('resize', () => {
  window.requestAnimationFrame(handleResize);
});

// self explanatory >_<
const CONTACTS = [
  { label: "Email",  icon: "assets/images/email_icon.png",  link: "mailto:a.palmeirim03@gmail.com" },
  { label: "Phone",  icon: "assets/images/phone_icon.png",  link: "+351925307378" },
  { label: "GitHub", icon: "assets/images/github_icon.png", link: "https://github.com/apalmeirim" },
  { label: "LinkedIn", icon: "assets/images/linkedin_icon.png", link: "https://www.linkedin.com/in/antonio-palmeirim-912200265/" }
];

const loadedImages = {};

//  preload icons
function preloadImages(callback) {
  let loadedCount = 0;
  CONTACTS.forEach(c => {
    const img = new Image();
    img.src = c.icon;
    img.onload = () => {
      loadedImages[c.label] = img;
      loadedCount++;
      if (loadedCount === CONTACTS.length) callback();
    };
  });
}

//  contact blocks creation
function createBlocks() {
  CONTACTS.forEach(c => {
    const size = 100;
    const posX = Math.random() * (canvasWidth - size * 2) + size;
    const posY = Math.random() * 200 + 50;
    const box = Bodies.rectangle(posX, posY, size, size, {
      restitution: 0.6,
      frictionAir: 0.02,
      render: { 
        fillStyle: "#eeb288ff", 
        strokeStyle: "#000000ff",  // was strokestyle
        lineWidth: 2              // was linewidth
      }
    });
    box.contact = c;
    World.add(engine.world, box);
  });
}

//  after render - draw icons and labels
Events.on(render, "afterRender", function () {
  const ctx = render.context;

  // draw icons + labels
  engine.world.bodies.forEach(body => {
    if (!body.contact) return;

    const w = body.bounds.max.x - body.bounds.min.x;
    const h = body.bounds.max.y - body.bounds.min.y;

    ctx.save();
    ctx.translate(body.position.x, body.position.y);
    ctx.rotate(body.angle);

    const icon = loadedImages[body.contact.label];
    if (icon && icon.complete) {
      const maxSize = Math.min(w * 0.5, h * 0.5);
      ctx.drawImage(icon, -maxSize / 2, -maxSize / 2 - 10, maxSize, maxSize);
    }

    ctx.font = "14px monospace";
    ctx.fillStyle = "#000000ff";
    ctx.textAlign = "center";
    ctx.fillText(body.contact.label, 0, h * 0.3);

    ctx.restore();
    });

    // hover outline
    const hoveredBody = Query.point(engine.world.bodies, render.mouse.position).find(b => b.contact);
    if (hoveredBody) {
        const ctx2 = render.context;
        ctx2.save();
        ctx2.strokeStyle = "#00ff66";
        ctx2.lineWidth = 3;
        const verts = hoveredBody.vertices;
        ctx2.beginPath();
        ctx2.moveTo(verts[0].x, verts[0].y);
        for (let i = 1; i < verts.length; i++) ctx2.lineTo(verts[i].x, verts[i].y);
        ctx2.closePath();
        ctx2.stroke();
        ctx2.restore();
    }
});

// box safety net
Events.on(engine, "afterUpdate", () => {
  engine.world.bodies.forEach(body => {
    if (body.contact) {
      if (
        body.position.x < -200 || body.position.x > canvasWidth + 200 ||
        body.position.y < -200 || body.position.y > canvasHeight + 200
      ) {
        Matter.Body.setPosition(body, {
          x: canvasWidth / 2 + (Math.random() * 200 - 100),
          y: 100
        });
        Matter.Body.setVelocity(body, { x: 0, y: 0 });
      }
    }
  });
});

// gentle drift maintenance when gravity is off
Events.on(engine, "beforeUpdate", () => {
  if (!gravityEnabled) {
    engine.world.bodies.forEach(b => {
      if (b.contact) {
        // give a very small random nudge occasionally
        const driftChance = 0.01; // 1% chance each tick
        if (Math.random() < driftChance) {
          const vx = (Math.random() - 0.5) * 0.3;
          const vy = (Math.random() - 0.5) * 0.3;
          Matter.Body.setVelocity(b, { x: b.velocity.x + vx, y: b.velocity.y + vy });
        }
      }
    });
  }
});

// mouse behavior
let mouseDownPos = null;
let mouseDownTime = 0;

canvas.addEventListener("mousedown", e => {
  mouseDownPos = { x: e.offsetX, y: e.offsetY };
  mouseDownTime = Date.now();
});

canvas.addEventListener("mouseup", e => {
  const timeHeld = Date.now() - mouseDownTime;
  const dx = e.offsetX - mouseDownPos.x;
  const dy = e.offsetY - mouseDownPos.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // only treat as a click if it's quick and not dragged far
  if (timeHeld < 250 && distance < 5) {
    const mousePos = { x: e.offsetX, y: e.offsetY };
    const clicked = Matter.Query.point(engine.world.bodies, mousePos)
      .find(b => b.contact);

    if (clicked && clicked.contact) {
      if (clicked.contact.label === "Phone") {
        showPopup("phone", "📞 +351 925 307 378");
      } else if (clicked.contact.label === "Email") {
        showPopup("email", "a.palmeirim03@gmail.com");
      } else if (clicked.contact.link) {
        window.open(clicked.contact.link, "_blank");
      }
     }
    }
});

Events.on(mouseConstraint, "mousemove", () => {
  const dragged = mouseConstraint.constraint.bodyB;
  if (!dragged) return;

  const p = render.mouse.position;
  const b = dragged.bounds;
  const padding = 10;

  // normal leave-box drop check
  const within =
    p.x > b.min.x - padding &&
    p.x < b.max.x + padding &&
    p.y > b.min.y - padding &&
    p.y < b.max.y + padding;

  // distance check — if the block flies too far from the mouse, release it
  const dx = dragged.position.x - p.x;
  const dy = dragged.position.y - p.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (!within || distance > 120) {
    mouseConstraint.constraint.bodyB = null; // drop it
  }
});

//  box scale effect
let grabbed = null;
let originalScales = new WeakMap();

// when a body is grabbed
Events.on(mouseConstraint, "startdrag", (event) => {
  const body = event.body;
  if (!body || !body.contact) return;

  // if another body is already grabbed, release it first
  if (grabbed && grabbed !== body) {
    Matter.Body.scale(grabbed, 1 / 1.15, 1 / 1.15);
  }

  // prevent double scaling if startdrag fires multiple times
  if (!originalScales.has(body)) {
    originalScales.set(body, { x: body.bounds.max.x - body.bounds.min.x, y: body.bounds.max.y - body.bounds.min.y });
    Matter.Body.scale(body, 1.15, 1.15);
  }

  grabbed = body;
});

// when a body is released
Events.on(mouseConstraint, "enddrag", (event) => {
  const body = event.body;
  if (body && body.contact && originalScales.has(body)) {
    try {
      Matter.Body.scale(body, 1 / 1.15, 1 / 1.15);
    } catch (e) {
      console.warn("Scale restore skipped:", e);
    }
    originalScales.delete(body);
  }
  grabbed = null;
});

// extra safeguard: if constraint breaks unexpectedly, reset scaling
Events.on(engine, "afterUpdate", () => {
  if (!mouseConstraint.constraint.bodyB && grabbed) {
    if (originalScales.has(grabbed)) {
      Matter.Body.scale(grabbed, 1 / 1.15, 1 / 1.15);
      originalScales.delete(grabbed);
    }
    grabbed = null;
  }
});

// for phone touch support
canvas.addEventListener("touchstart", e => {
  const touch = e.touches[0];
  mouseDownPos = { x: touch.clientX - canvas.getBoundingClientRect().left,
                   y: touch.clientY - canvas.getBoundingClientRect().top };
  mouseDownTime = Date.now();
});

canvas.addEventListener("touchend", e => {
  const touch = e.changedTouches[0];
  const rect = canvas.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  const timeHeld = Date.now() - mouseDownTime;
  const dx = x - mouseDownPos.x;
  const dy = y - mouseDownPos.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (timeHeld < 250 && distance < 10) {
    const clicked = Matter.Query.point(engine.world.bodies, { x, y })
      .find(b => b.contact);
    if (clicked && clicked.contact) {
      if (clicked.contact.label === "Phone") {
        showPopup("phone", "📞 +351 925 307 378");
      } else if (clicked.contact.label === "Email") {
        showPopup("email", "a.palmeirim03@gmail.com");
      } else if (clicked.contact.link) {
        window.open(clicked.contact.link, "_blank");
      }
    }
  }
});

canvas.addEventListener("touchmove", e => e.preventDefault(), { passive: false });

// ghosting prevention
// future fix :d

// gravity toggle
const gravityBtn = document.getElementById("gravityBtn");
let gravityEnabled = true;

function updateGravityButton() {
  gravityBtn.textContent = gravityEnabled ? "Gravity: ON" : "Gravity: OFF";
  gravityBtn.style.borderColor = gravityEnabled ? "#00ff66" : "#ff4444";
  gravityBtn.style.color = gravityEnabled ? "#00ff66" : "#ff4444";
}

gravityBtn.addEventListener("click", () => {
  gravityEnabled = !gravityEnabled;
  engine.gravity.y = gravityEnabled ? 1 : 0;
  updateGravityButton();

  // if turning gravity off, give everything a gentle drift
  if (!gravityEnabled) {
    engine.world.bodies.forEach(b => {
      if (b.contact) {
        const driftX = (Math.random() - 0.5) * 1.5;  // small random velocity
        const driftY = (Math.random() - 0.5) * 1.5;
        Matter.Body.setVelocity(b, { x: driftX, y: driftY });
      }
    });
  }
});

updateGravityButton(); // initialize button state

// phone popup
const popup = document.getElementById("popup");
const popupText = document.getElementById("popupText");
const popupButtons = document.getElementById("popupButtons");
const closePopup = document.getElementById("closePopup");

function showPopup(type, text) {
  popupText.textContent = text;
  popup.classList.remove("hidden");


  // button reset
  popupButtons.innerHTML = '';

  // always add close button
  const closeBtn = document.createElement('button');
  closeBtn.id = "closePopup";
  closeBtn.textContent = "CLOSE";
  closeBtn.onclick = () => popup.classList.add("hidden");
  popupButtons.appendChild(closeBtn);

  // add special copy button for email popups
  if (type === "email") {
    const copyBtn = document.createElement("button");
    copyBtn.textContent = "COPY";
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = "COPIED!";
        copyBtn.style.background = "#00ff66";
        copyBtn.style.color = "black";
        setTimeout(() => {
          copyBtn.textContent = "COPY";
          copyBtn.style.background = "none";
          copyBtn.style.color = "#00ff66";
        }, 1200);
      } catch (err) {
        copyBtn.textContent = "FAILED";
        console.error("Clipboard error:", err);
      }
    });
    popupButtons.appendChild(copyBtn);
  }
}

// close when clicking the dark background
popup.addEventListener("click", e => {
  if (e.target === popup) popup.classList.add("hidden");
});

//  init
preloadImages(() => {
  createBlocks();
});


