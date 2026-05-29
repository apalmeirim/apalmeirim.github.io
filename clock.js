(function () {
  const clockEl = document.getElementById("clock");
  const dateEl = document.getElementById("clock-date");
  const backLinkEl = document.querySelector(".clock-back-link");
  const BACK_LINK_FADE_DELAY_MS = 1000;

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

  function fadeBackLink() {
    if (!backLinkEl) {
      return;
    }
    backLinkEl.classList.add("is-faded");
  }

  if (backLinkEl) {
    setTimeout(fadeBackLink, BACK_LINK_FADE_DELAY_MS);
  }

  updateClock();
  setInterval(updateClock, 1000);
})();
