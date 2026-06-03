(function () {
  const clockEl = document.getElementById("clock");
  const dateEl = document.getElementById("clock-date");
  const utcEl = document.getElementById("clock-date-utc");
  const backLinkEl = document.querySelector(".clock-back-link");
  const BACK_LINK_FADE_DELAY_MS = 1000;

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function formatDate(date) {
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    return `${year}-${month}-${day}`;
  }

  function formatUtcTime(date) {
    const hours = pad(date.getUTCHours());
    const minutes = pad(date.getUTCMinutes());
    const seconds = pad(date.getUTCSeconds());
    return `${hours}:${minutes}:${seconds} UTC`;
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
    if (utcEl) {
      utcEl.textContent = formatUtcTime(now);
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
