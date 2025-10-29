import Matter from 'matter-js';

const {
  Engine,
  Render,
  Runner,
  Bodies,
  Body,
  World,
  Mouse,
  MouseConstraint,
  Events,
  Query,
} = Matter;

const CONTACTS = [
  { label: 'Email', icon: '/assets/images/email_icon.png', value: 'a.palmeirim03@gmail.com' },
  { label: 'Phone', icon: '/assets/images/phone_icon.png', value: '+351 925 307 378' },
  { label: 'GitHub', icon: '/assets/images/github_icon.png', link: 'https://github.com/apalmeirim' },
  {
    label: 'LinkedIn',
    icon: '/assets/images/linkedin_icon.png',
    link: 'https://www.linkedin.com/in/antonio-palmeirim-912200265/',
  },
];

const loadedImages = {};

function preloadImages(callback) {
  let loadedCount = 0;
  CONTACTS.forEach((contact) => {
    const img = new Image();
    img.src = contact.icon;
    img.onload = () => {
      loadedImages[contact.label] = img;
      loadedCount += 1;
      if (loadedCount === CONTACTS.length) callback();
    };
  });
}

export function createLinksSimulation({
  canvas,
  gravityButton,
  popup,
  popupText,
  popupButtons,
} = {}) {
  if (!canvas || !gravityButton || !popup || !popupText || !popupButtons) {
    return {
      destroy: () => {},
    };
  }

  let destroyed = false;

  const computeCanvasSize = () => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      const width = Math.min(window.innerWidth * 0.9, 400);
      const height = width * 1.2;
      return { width: Math.round(width), height: Math.round(height) };
    }
    const size = Math.max(Math.min(window.innerHeight * 0.8, 520), 300);
    return { width: Math.round(size), height: Math.round(size) };
  };

  let { width: canvasWidth, height: canvasHeight } = computeCanvasSize();

  const syncCanvasDimensions = () => {
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
  };

  syncCanvasDimensions();

  const engine = Engine.create();
  const render = Render.create({
    canvas,
    engine,
    options: {
      width: canvasWidth,
      height: canvasHeight,
      wireframes: false,
      background: 'transparent',
    },
  });

  render.bounds = {
    min: { x: 0, y: 0 },
    max: { x: canvasWidth, y: canvasHeight },
  };

  const runner = Runner.create({
    delta: 1000 / 120,
  });

  Render.run(render);
  Runner.run(runner, engine);

  const mouse = Mouse.create(render.canvas);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: 0.7, render: { visible: false } },
  });
  World.add(engine.world, mouseConstraint);
  render.mouse = mouse;

  let ground;
  let leftWall;
  let rightWall;
  let ceiling;

  const rebuildBounds = () => {
    if (ground) {
      World.remove(engine.world, [ground, ceiling, leftWall, rightWall]);
    }
    ground = Bodies.rectangle(canvasWidth / 2, canvasHeight + 20, canvasWidth, 40, { isStatic: true });
    leftWall = Bodies.rectangle(-20, canvasHeight / 2, 40, canvasHeight, { isStatic: true });
    rightWall = Bodies.rectangle(canvasWidth + 20, canvasHeight / 2, 40, canvasHeight, { isStatic: true });
    ceiling = Bodies.rectangle(canvasWidth / 2, -20, canvasWidth, 40, { isStatic: true });
    World.add(engine.world, [ground, ceiling, leftWall, rightWall]);
  };

  rebuildBounds();

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const rescaleContactBodies = (scaleX, scaleY) => {
    engine.world.bodies.forEach((body) => {
      if (!body.contact) return;
      const halfWidth = (body.bounds.max.x - body.bounds.min.x) / 2;
      const halfHeight = (body.bounds.max.y - body.bounds.min.y) / 2;
      const newX = clamp(body.position.x * scaleX, halfWidth + 8, canvasWidth - halfWidth - 8);
      const newY = clamp(body.position.y * scaleY, halfHeight + 8, canvasHeight - halfHeight - 8);
      Body.setPosition(body, { x: newX, y: newY });
    });
  };

  const handleResize = () => {
    if (destroyed) return;
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
  };

  const domListeners = [];
  const addDomListener = (target, event, handler, options) => {
    target.addEventListener(event, handler, options);
    domListeners.push({ target, event, handler, options });
  };

  const matterListeners = [];
  const addMatterListener = (target, eventName, handler) => {
    Events.on(target, eventName, handler);
    matterListeners.push({ target, eventName, handler });
  };

  const resizeListener = () => {
    window.requestAnimationFrame(handleResize);
  };
  addDomListener(window, 'resize', resizeListener);

  let gravityEnabled = true;

  const updateGravityButton = () => {
    gravityButton.textContent = gravityEnabled ? 'Gravity: ON' : 'Gravity: OFF';
    gravityButton.style.borderColor = gravityEnabled ? '#00ff66' : '#ff4444';
    gravityButton.style.color = gravityEnabled ? '#00ff66' : '#ff4444';
  };

  const setGravity = (enabled) => {
    gravityEnabled = enabled;
    engine.gravity.y = gravityEnabled ? 1 : 0;
    updateGravityButton();
  };

  const toggleGravity = () => {
    setGravity(!gravityEnabled);
    if (!gravityEnabled) {
      engine.world.bodies.forEach((body) => {
        if (body.contact) {
          const driftX = (Math.random() - 0.5) * 1.5;
          const driftY = (Math.random() - 0.5) * 1.5;
          Body.setVelocity(body, { x: driftX, y: driftY });
        }
      });
    }
  };

  addDomListener(gravityButton, 'click', toggleGravity);
  updateGravityButton();

  let mouseDownPos = null;
  let mouseDownTime = 0;

  const showPopup = (type, text) => {
    popupText.textContent = text;
    popup.classList.remove('hidden');
    popupButtons.innerHTML = '';

    const closeBtn = document.createElement('button');
    closeBtn.id = 'closePopup';
    closeBtn.textContent = 'CLOSE';
    closeBtn.onclick = () => popup.classList.add('hidden');
    popupButtons.appendChild(closeBtn);

    if (type === 'email') {
      const copyBtn = document.createElement('button');
      copyBtn.textContent = 'COPY';
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(text);
          copyBtn.textContent = 'COPIED!';
          copyBtn.style.background = '#00ff66';
          copyBtn.style.color = 'black';
          setTimeout(() => {
            copyBtn.textContent = 'COPY';
            copyBtn.style.background = 'none';
            copyBtn.style.color = '#00ff66';
          }, 1200);
        } catch (err) {
          copyBtn.textContent = 'FAILED';
          // eslint-disable-next-line no-console
          console.error('Clipboard error:', err);
        }
      });
      popupButtons.appendChild(copyBtn);
    }
  };

  const handleCanvasMouseDown = (event) => {
    mouseDownPos = { x: event.offsetX, y: event.offsetY };
    mouseDownTime = Date.now();
  };

  const openContact = (contact) => {
    if (!contact) return;
    if (contact.label === 'Phone') {
      showPopup('phone', contact.value ?? '+351 925 307 378');
    } else if (contact.label === 'Email') {
      showPopup('email', contact.value ?? 'a.palmeirim03@gmail.com');
    } else if (contact.link) {
      window.open(contact.link, '_blank', 'noopener');
    }
  };

  const handleCanvasMouseUp = (event) => {
    const timeHeld = Date.now() - mouseDownTime;
    const dx = event.offsetX - mouseDownPos.x;
    const dy = event.offsetY - mouseDownPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (timeHeld < 250 && distance < 5) {
      const mousePos = { x: event.offsetX, y: event.offsetY };
      const clicked = Query.point(engine.world.bodies, mousePos).find((body) => body.contact);
      if (clicked?.contact) {
        openContact(clicked.contact);
      }
    }
  };

  addDomListener(canvas, 'mousedown', handleCanvasMouseDown);
  addDomListener(canvas, 'mouseup', handleCanvasMouseUp);

  const handleTouchStart = (event) => {
    const touch = event.touches[0];
    const rect = canvas.getBoundingClientRect();
    mouseDownPos = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    mouseDownTime = Date.now();
  };

  const handleTouchEnd = (event) => {
    const touch = event.changedTouches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const timeHeld = Date.now() - mouseDownTime;
    const dx = x - mouseDownPos.x;
    const dy = y - mouseDownPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (timeHeld < 250 && distance < 10) {
      const clicked = Query.point(engine.world.bodies, { x, y }).find((body) => body.contact);
      if (clicked?.contact) {
        openContact(clicked.contact);
      }
    }
  };

  const preventTouchScroll = (event) => event.preventDefault();

  addDomListener(canvas, 'touchstart', handleTouchStart);
  addDomListener(canvas, 'touchend', handleTouchEnd);
  addDomListener(canvas, 'touchmove', preventTouchScroll, { passive: false });

  const handlePopupClick = (event) => {
    if (event.target === popup) popup.classList.add('hidden');
  };
  addDomListener(popup, 'click', handlePopupClick);

  const createBlocks = () => {
    CONTACTS.forEach((contact) => {
      const size = 100;
      const posX = Math.random() * (canvasWidth - size * 2) + size;
      const posY = Math.random() * 200 + 50;
      const box = Bodies.rectangle(posX, posY, size, size, {
        restitution: 0.6,
        frictionAir: 0.02,
        render: {
          fillStyle: '#eeb288ff',
          strokeStyle: '#000000ff',
          lineWidth: 2,
        },
      });
      box.contact = contact;
      World.add(engine.world, box);
    });
  };

  const afterRender = () => {
    const ctx = render.context;
    engine.world.bodies.forEach((body) => {
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
      ctx.fillStyle = '#000000ff';
      ctx.textAlign = 'center';
      ctx.fillText(body.contact.label, 0, h * 0.3);
      ctx.restore();
    });

    const hoveredBody = Query.point(engine.world.bodies, render.mouse.position).find((body) => body.contact);
    if (hoveredBody) {
      const ctx2 = render.context;
      ctx2.save();
      ctx2.strokeStyle = '#00ff66';
      ctx2.lineWidth = 3;
      const verts = hoveredBody.vertices;
      ctx2.beginPath();
      ctx2.moveTo(verts[0].x, verts[0].y);
      for (let i = 1; i < verts.length; i += 1) ctx2.lineTo(verts[i].x, verts[i].y);
      ctx2.closePath();
      ctx2.stroke();
      ctx2.restore();
    }
  };

  addMatterListener(render, 'afterRender', afterRender);

  const safetyNet = () => {
    engine.world.bodies.forEach((body) => {
      if (body.contact) {
        if (
          body.position.x < -200 ||
          body.position.x > canvasWidth + 200 ||
          body.position.y < -200 ||
          body.position.y > canvasHeight + 200
        ) {
          Body.setPosition(body, {
            x: canvasWidth / 2 + (Math.random() * 200 - 100),
            y: 100,
          });
          Body.setVelocity(body, { x: 0, y: 0 });
        }
      }
    });
  };

  addMatterListener(engine, 'afterUpdate', safetyNet);

  const driftMaintenance = () => {
    if (!gravityEnabled) {
      engine.world.bodies.forEach((body) => {
        if (body.contact) {
          if (Math.random() < 0.01) {
            const vx = (Math.random() - 0.5) * 0.3;
            const vy = (Math.random() - 0.5) * 0.3;
            Body.setVelocity(body, { x: body.velocity.x + vx, y: body.velocity.y + vy });
          }
        }
      });
    }
  };

  addMatterListener(engine, 'beforeUpdate', driftMaintenance);

  let grabbed = null;
  const originalScales = new WeakMap();

  const mouseMove = () => {
    const dragged = mouseConstraint.constraint.bodyB;
    if (!dragged) return;
    const p = render.mouse.position;
    const bounds = dragged.bounds;
    const padding = 10;
    const within =
      p.x > bounds.min.x - padding &&
      p.x < bounds.max.x + padding &&
      p.y > bounds.min.y - padding &&
      p.y < bounds.max.y + padding;
    const dx = dragged.position.x - p.x;
    const dy = dragged.position.y - p.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (!within || distance > 120) {
      mouseConstraint.constraint.bodyB = null;
    }
  };

  addMatterListener(mouseConstraint, 'mousemove', mouseMove);

  const startDrag = (event) => {
    const body = event.body;
    if (!body || !body.contact) return;
    if (grabbed && grabbed !== body) {
      Body.scale(grabbed, 1 / 1.15, 1 / 1.15);
    }
    if (!originalScales.has(body)) {
      originalScales.set(body, {
        x: body.bounds.max.x - body.bounds.min.x,
        y: body.bounds.max.y - body.bounds.min.y,
      });
      Body.scale(body, 1.15, 1.15);
    }
    grabbed = body;
  };

  addMatterListener(mouseConstraint, 'startdrag', startDrag);

  const endDrag = (event) => {
    const body = event.body;
    if (body && body.contact && originalScales.has(body)) {
      try {
        Body.scale(body, 1 / 1.15, 1 / 1.15);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('Scale restore skipped:', error);
      }
      originalScales.delete(body);
    }
    grabbed = null;
  };

  addMatterListener(mouseConstraint, 'enddrag', endDrag);

  const resetGrabbed = () => {
    if (!mouseConstraint.constraint.bodyB && grabbed) {
      if (originalScales.has(grabbed)) {
        Body.scale(grabbed, 1 / 1.15, 1 / 1.15);
        originalScales.delete(grabbed);
      }
      grabbed = null;
    }
  };

  addMatterListener(engine, 'afterUpdate', resetGrabbed);

  preloadImages(() => {
    if (!destroyed) {
      createBlocks();
    }
  });

  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      matterListeners.forEach(({ target, eventName, handler }) => {
        Events.off(target, eventName, handler);
      });
      domListeners.forEach(({ target, event, handler, options }) => {
        target.removeEventListener(event, handler, options);
      });
      popup.classList.add('hidden');
      mouseConstraint.constraint.bodyB = null;
      Runner.stop(runner);
      Render.stop(render);
      World.clear(engine.world, false);
      Engine.clear(engine);
    },
  };
}
