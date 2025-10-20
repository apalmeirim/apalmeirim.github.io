// contact.js - floating contact blocks

const { Engine, Render, Runner, Bodies, World, Mouse, MouseConstraint, Events } = Matter;

const canvas = document.getElementById("world");
const WIDTH = window.innerWidth * 0.8;
const HEIGHT = window.innerHeight * 0.7;

const engine = Engine.create();
const render = Render.create({
  canvas: canvas,
  engine: engine,
  options: {
    width: WIDTH,
    height: HEIGHT,
    wireframes: false,
    background: "#000"
  }
});

Render.run(render);
Runner.run(Runner.create(), engine);

const ground = Bodies.rectangle(WIDTH / 2, HEIGHT + 20, WIDTH, 40, { isStatic: true });
const leftWall = Bodies.rectangle(-20, HEIGHT / 2, 40, HEIGHT, { isStatic: true });
const rightWall = Bodies.rectangle(WIDTH + 20, HEIGHT / 2, 40, HEIGHT, { isStatic: true });
const ceiling = Bodies.rectangle(WIDTH / 2, -20, WIDTH, 40, { isStatic: true });
World.add(engine.world, [ground, ceiling, leftWall, rightWall]);

const CONTACTS = [
  { label: "Email",  icon: "assets/images/email_icon.png",  link: "mailto:you@example.com" },
  { label: "Phone",  icon: "assets/images/phone_icon.png",  link: "tel:+123456789" },
  { label: "GitHub", icon: "assets/images/github_icon.png", link: "https://github.com/your-username" },
  { label: "LinkedIn", icon: "assets/images/linkedin_icon.png", link: "https://www.linkedin.com/in/your-profile" }
];

const loadedImages = {};

//preload icons
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

//contact blocks
function createBlocks() {
  CONTACTS.forEach(c => {
    const size = 100;
    const posX = Math.random() * (WIDTH - size * 2) + size;
    const posY = Math.random() * 200 + 50; // random height between 50–250
    const box = Bodies.rectangle(posX, posY, size, size, {
      restitution: 0.6,
      render: { fillStyle: "#111", strokeStyle: "#00ff66", lineWidth: 2 }
    });
    box.contact = c;
    World.add(engine.world, box);
  });
}

//icon drawing
Events.on(render, "afterRender", function () {
  const ctx = render.context;

  engine.world.bodies.forEach(body => {
    if (!body.contact) return;

    const w = body.bounds.max.x - body.bounds.min.x;
    const h = body.bounds.max.y - body.bounds.min.y;

    ctx.save();
    ctx.translate(body.position.x, body.position.y);
    ctx.rotate(body.angle);

    // draw icon
    const icon = loadedImages[body.contact.label];
    if (icon) {
      const maxSize = Math.min(w * 0.5, h * 0.5);
      ctx.drawImage(icon, -maxSize / 2, -maxSize / 2 - 10, maxSize, maxSize);
    }

    // draw label
    ctx.font = "14px monospace";
    ctx.fillStyle = "#00ff66";
    ctx.textAlign = "center";
    ctx.fillText(body.contact.label, 0, h * 0.3);

    ctx.restore();
  });
});

//box saftey net
Events.on(engine, "afterUpdate", () => {
  engine.world.bodies.forEach(body => {
    if (body.contact) {
      if (
        body.position.x < -200 || body.position.x > WIDTH + 200 ||
        body.position.y < -200 || body.position.y > HEIGHT + 200
      ) {
        Matter.Body.setPosition(body, {
          x: WIDTH / 2 + (Math.random() * 200 - 100),
          y: 100
        });
        Matter.Body.setVelocity(body, { x: 0, y: 0 });
      }
    }
  });
});


//mouse drag
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: { stiffness: 0.2, render: { visible: false } }
});
World.add(engine.world, mouseConstraint);

//open box with click
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

  // Only treat as a click if it's quick and not dragged far
  if (timeHeld < 250 && distance < 5) {
    const mousePos = { x: e.offsetX, y: e.offsetY };
    const clicked = Matter.Query.point(engine.world.bodies, mousePos)
      .find(b => b.contact);

    if (clicked && clicked.contact.link) {
      window.open(clicked.contact.link, "_blank");
    }
  }
});

//stop mouse dragging when mouse leaves box
Events.on(mouseConstraint, "enddrag", event => {
  mouseConstraint.constraint.bodyB = null; // force release
});

window.addEventListener("mouseup", () => {
    mouseConstraint.constraint.bodyB = null; // force release
}); 
//init
preloadImages(() => {
  createBlocks();
});
