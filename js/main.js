document.addEventListener('DOMContentLoaded', () => {
  // Adjust the path if your site isn't at root:
  // use 'components/navbar.html' if files are in same directory level
  fetch('/components/navbar.html')
    .then(res => res.text())
    .then(html => {
      const mount = document.getElementById('navbar-container');
      if (!mount) return;
      mount.innerHTML = html;
      initNavbar();
    })
    .catch(err => console.error('Navbar load failed:', err));
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

  // Apply saved theme on load
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
  }

  // Highlight current page link
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('#mainNav a').forEach(a => {
    if (a.getAttribute('href') === current) a.classList.add('active');
  });
}
