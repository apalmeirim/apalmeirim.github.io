(function () {
  const clockEl = document.getElementById("clock");
  const dateEl = document.getElementById("clock-date");
  const themeToggleEl = document.getElementById("clock-theme-toggle");
  const pageBody = document.body;
  const THEME_STORAGE_KEY = "clock-theme";

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function formatDate(date) {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  }

  function updateToggleLabel() {
    if (!themeToggleEl) return;
    const isInverted = pageBody.classList.contains("clock-inverted");
    themeToggleEl.textContent = isInverted ? "light" : "dark";
  }

  function applyStoredTheme() {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "inverted") {
      pageBody.classList.add("clock-inverted");
    }
    updateToggleLabel();
  }

  function updateClock() {
    const now = new Date();
    const h = pad(now.getHours());
    const m = pad(now.getMinutes());
    const s = pad(now.getSeconds());
    clockEl.textContent = `${h}:${m}:${s}`;
    if (dateEl) {
      dateEl.textContent = formatDate(now);
    }
  }

  if (themeToggleEl) {
    themeToggleEl.addEventListener("click", () => {
      const isInverted = pageBody.classList.toggle("clock-inverted");
      localStorage.setItem(THEME_STORAGE_KEY, isInverted ? "inverted" : "default");
      updateToggleLabel();
    });
  }

  applyStoredTheme();
  updateClock();
  setInterval(updateClock, 1000);
})();
