(function () {
  const shortcutEls = document.querySelectorAll("[data-shortcut-key]");

  if (!shortcutEls.length) {
    return;
  }

  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }

    const target = event.target;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
      return;
    }

    const key = event.key.toLowerCase();
    shortcutEls.forEach((el) => {
      if (el.dataset.shortcutKey === key) {
        el.click();
      }
    });
  });
})();

(function () {
  const THEME_STORAGE_KEY = "site-theme";
  const pageBody = document.body;
  const themeToggleEl = document.getElementById("site-theme-toggle");

  function applyTheme(theme) {
    const isDark = theme === "dark";
    pageBody.classList.toggle("theme-dark", isDark);
    pageBody.dataset.theme = isDark ? "dark" : "light";
    updateToggleLabel();
    window.dispatchEvent(
      new CustomEvent("site-theme-change", {
        detail: { theme: isDark ? "dark" : "light" },
      })
    );
  }

  function updateToggleLabel() {
    if (!themeToggleEl) return;
    const isDark = pageBody.classList.contains("theme-dark");
    const nextTheme = isDark ? "light" : "dark";
    themeToggleEl.setAttribute("aria-label", `switch to ${nextTheme} mode`);
    themeToggleEl.setAttribute("title", `switch to ${nextTheme} mode`);
  }

  function applyStoredTheme() {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    applyTheme(stored === "dark" ? "dark" : "light");
  }

  if (themeToggleEl) {
    themeToggleEl.addEventListener("click", () => {
      const nextTheme = pageBody.classList.contains("theme-dark") ? "light" : "dark";
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      applyTheme(nextTheme);
    });
  }

  window.addEventListener("storage", (event) => {
    if (event.key !== THEME_STORAGE_KEY) {
      return;
    }
    applyTheme(event.newValue === "dark" ? "dark" : "light");
  });

  applyStoredTheme();
})();

(function () {
  const SOUND_STORAGE_KEY = "site-sound-track";
  const soundToggleEl = document.getElementById("sound-toggle");
  const soundMenuEl = document.getElementById("sound-menu");
  const audioEl = document.getElementById("site-sound-audio");

  if (!soundToggleEl || !soundMenuEl || !audioEl) {
    return;
  }

  const TRACKS = {
    1: "../misc/sounds/short/03-White-Noise-10min.mp3",
    2: "../misc/sounds/short/07-PinkNoise-10min.mp3",
    3: "../misc/sounds/short/25-Ocean-10min.mp3",
    4: "../misc/sounds/short/32-Waterfall-10min.mp3",
    5: "../misc/sounds/short/42-Rain-10min.mp3",
  };

  const menuItems = soundMenuEl.querySelectorAll(".sound-menu-item");

  function openMenu() {
    soundMenuEl.hidden = false;
    soundToggleEl.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    soundMenuEl.hidden = true;
    soundToggleEl.setAttribute("aria-expanded", "false");
  }

  function highlightSelected(track) {
    menuItems.forEach((item) => {
      item.classList.toggle("is-selected", item.dataset.track === String(track));
    });
  }

  function selectTrack(track) {
    if (track === "0") {
      audioEl.pause();
      audioEl.removeAttribute("src");
      localStorage.removeItem(SOUND_STORAGE_KEY);
      highlightSelected("0");
      return;
    }

    const src = TRACKS[track];
    if (!src) {
      return;
    }

    audioEl.src = src;
    audioEl.currentTime = 0;
    audioEl.play().catch(() => {});
    localStorage.setItem(SOUND_STORAGE_KEY, track);
    highlightSelected(track);
  }

  soundToggleEl.addEventListener("click", (event) => {
    event.stopPropagation();
    if (soundMenuEl.hidden) {
      openMenu();
    } else {
      closeMenu();
    }
  });

  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      selectTrack(item.dataset.track);
      closeMenu();
    });
  });

  document.addEventListener("click", (event) => {
    if (!soundMenuEl.hidden && !soundMenuEl.contains(event.target) && event.target !== soundToggleEl) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !soundMenuEl.hidden) {
      closeMenu();
      soundToggleEl.focus();
    }
  });

  audioEl.addEventListener("play", () => soundToggleEl.classList.add("is-playing"));
  audioEl.addEventListener("pause", () => soundToggleEl.classList.remove("is-playing"));

  const storedTrack = localStorage.getItem(SOUND_STORAGE_KEY);
  if (storedTrack && TRACKS[storedTrack]) {
    selectTrack(storedTrack);
  } else {
    highlightSelected("0");
  }
})();
