const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
  document.body.classList.remove('dark-mode');
} else {
  document.body.classList.add('dark-mode');
}

document.addEventListener('DOMContentLoaded', () => {
  loadNavbar();
  initTerminalOverlay();
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
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('theme',
        document.body.classList.contains('dark-mode') ? 'dark' : 'light'
      );
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

  const scriptEl = document.currentScript || document.querySelector('script[src*="js/main.js"]');
  const scriptURL = scriptEl
    ? new URL(scriptEl.getAttribute('src'), window.location.href)
    : new URL('js/main.js', window.location.href);

  const candidateUrls = [
    new URL('../components/navbar.html', scriptURL).href,
    new URL('../../components/navbar.html', scriptURL).href,
    new URL('components/navbar.html', window.location.href).href,
    new URL('./components/navbar.html', window.location.href).href
  ];

  let lastError = null;

  for (const url of candidateUrls) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) {
        lastError = new Error(`HTTP ${res.status} for ${url}`);
        continue;
      }
      const html = await res.text();
      mount.innerHTML = html;
      initNavbar();
      return;
    } catch (err) {
      lastError = err;
    }
  }

  if (lastError) {
    console.error('Navbar load failed:', lastError);
  }
}

function initTerminalOverlay() {
  const overlay = document.getElementById('terminalOverlay');
  const openBtn = document.getElementById('openTerminalBtn');
  const closeBtn = document.getElementById('closeTerminalBtn');
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
  closeBtn?.addEventListener('click', closeOverlay);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeOverlay();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !isHidden()) {
      closeOverlay();
    }
  });
}
