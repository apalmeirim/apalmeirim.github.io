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
