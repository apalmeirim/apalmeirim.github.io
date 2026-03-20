(function () {
  const clockEl = document.getElementById("clock");
  const dateEl = document.getElementById("clock-date");

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

  updateClock();
  setInterval(updateClock, 1000);
})();
