(function () {
  const THEME_STORAGE_KEY = "site-theme";
  const pageBody = document.body;
  const themeToggleEl = document.getElementById("site-theme-toggle");

  function updateToggleLabel() {
    if (!themeToggleEl) return;
    const isDark = pageBody.classList.contains("theme-dark");
    const nextTheme = isDark ? "light" : "dark";
    themeToggleEl.setAttribute("aria-label", `switch to ${nextTheme} mode`);
    themeToggleEl.setAttribute("title", `switch to ${nextTheme} mode`);
  }

  function applyStoredTheme() {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "dark") {
      pageBody.classList.add("theme-dark");
    }
    updateToggleLabel();
  }

  if (themeToggleEl) {
    themeToggleEl.addEventListener("click", () => {
      const isDark = pageBody.classList.toggle("theme-dark");
      localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");
      updateToggleLabel();
    });
  }

  applyStoredTheme();
})();
