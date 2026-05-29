(function () {
  const STORAGE_KEY = "click-count";
  const countEl = document.getElementById("click-count");
  const buttonEl = document.getElementById("click-button");
  const crumbsEl = document.getElementById("cookie-crumbs");

  const COOKIE_COLORS = {
    chip: "#4a2512",
    crumbLight: "#ef9f58",
    crumbMid: "#db8b45",
    crumbDark: "#bf7437",
  };

  function readCount() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = Number.parseInt(saved ?? "0", 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  }

  function writeCount(value) {
    localStorage.setItem(STORAGE_KEY, String(value));
  }

  function renderCount(value) {
    if (countEl) {
      countEl.textContent = String(value);
    }
  }

  function spawnCrumbs() {
    if (!crumbsEl) {
      return;
    }

    const crumbsToCreate = 14;
    for (let i = 0; i < crumbsToCreate; i += 1) {
      const crumb = document.createElement("span");
      const startX = 36 + Math.random() * 56;
      const startY = 46 + Math.random() * 28;
      const driftX = (Math.random() - 0.5) * 72;
      const driftY = 36 + Math.random() * 50;
      const duration = 220 + Math.random() * 170;

      crumb.className = "cookie-crumb";
      crumb.style.left = `${startX}px`;
      crumb.style.top = `${startY}px`;
      const roll = Math.random();
      if (roll < 0.2) {
        crumb.style.background = COOKIE_COLORS.chip;
      } else if (roll < 0.55) {
        crumb.style.background = COOKIE_COLORS.crumbDark;
      } else if (roll < 0.85) {
        crumb.style.background = COOKIE_COLORS.crumbMid;
      } else {
        crumb.style.background = COOKIE_COLORS.crumbLight;
      }
      crumb.style.setProperty("--crumb-x", `${driftX}px`);
      crumb.style.setProperty("--crumb-y", `${driftY}px`);
      crumb.style.animationDuration = `${duration}ms`;

      crumbsEl.appendChild(crumb);
      window.setTimeout(() => {
        crumb.remove();
      }, duration + 30);
    }
  }

  function animateCrumble() {
    buttonEl.classList.remove("is-crumbling");
    void buttonEl.offsetWidth;
    buttonEl.classList.add("is-crumbling");
    window.setTimeout(() => {
      buttonEl.classList.remove("is-crumbling");
    }, 90);
  }

  if (!buttonEl || !countEl || !crumbsEl) {
    return;
  }

  let count = readCount();
  renderCount(count);

  buttonEl.addEventListener("click", () => {
    count += 1;
    renderCount(count);
    writeCount(count);
    animateCrumble();
    spawnCrumbs();
  });
})();
