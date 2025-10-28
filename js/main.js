const savedTheme = localStorage.getItem('theme');
applyTheme(savedTheme !== 'light');

document.addEventListener('DOMContentLoaded', () => {
  loadNavbar();
  initTerminalOverlay();
  initMainThemeToggle();
});

function initNavbar() {
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNav');
  const themeToggle = document.getElementById('themeToggle');

  // Menu toggle behavior (controls show/hidden + aria)
  if (menuToggle && nav) {
    const toggleMenu = () => {
      const isOpen = nav.classList.toggle('show');
      nav.hidden = false; // keep rendered for transition
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      // Click outside to close
      if (isOpen) {
        document.addEventListener('click', outsideClose);
      } else {
        document.removeEventListener('click', outsideClose);
      }
    };
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });
    function outsideClose(e) {
      if (!nav.contains(e.target) && e.target !== menuToggle) {
        nav.classList.remove('show');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.removeEventListener('click', outsideClose);
      }
    }
  }

  // Theme toggle in dropdown
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      toggleTheme();
    });
  }

  // Highlight current page link
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('#mainNav a').forEach(a => {
    if (a.getAttribute('href') === current) a.classList.add('active');
  });
}

async function loadNavbar() {
  const mount = document.getElementById('navbar-container');
  if (!mount) return;

  const url = new URL('components/navbar.html', window.location.href);

  try {
    const res = await fetch(url.href, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url.href}`);
    const html = await res.text();
    mount.innerHTML = html;
    initNavbar();
  } catch (err) {
    console.error('Navbar load failed:', err);
  }
}

function initTerminalOverlay() {
  const overlay = document.getElementById('terminalOverlay');
  const openBtn = document.getElementById('openTerminalBtn');
  const terminalInput = document.getElementById('terminal-input');

  if (!overlay || !openBtn) return;

  const setBodyLock = (lock) => {
    document.body.classList.toggle('modal-open', lock);
  };

  const isHidden = () => overlay.classList.contains('hidden');

  const openOverlay = () => {
    if (!isHidden()) return;
    if (typeof window.bootTerminal === 'function') {
      window.bootTerminal();
    }
    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
    setBodyLock(true);
    requestAnimationFrame(() => terminalInput?.focus());
  };

  const closeOverlay = () => {
    if (isHidden()) return;
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
    setBodyLock(false);
    openBtn.focus();
  };

  openBtn.addEventListener('click', openOverlay);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeOverlay();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !isHidden()) {
      closeOverlay();
    }
  });
}

function initMainThemeToggle() {
  const toggle = document.getElementById('mainThemeToggle');
  if (!toggle) return;
  updateFooterToggleState();
  toggle.addEventListener('click', () => {
    toggleTheme();
  });
}

function toggleTheme() {
  applyTheme(!isDarkMode());
}

function applyTheme(isDark) {
  document.body.classList.toggle('dark-mode', isDark);
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateFooterToggleState();
}

function isDarkMode() {
  return document.body.classList.contains('dark-mode');
}

function updateFooterToggleState() {
  const toggle = document.getElementById('mainThemeToggle');
  if (!toggle) return;
  toggle.setAttribute('aria-pressed', String(isDarkMode()));
}
