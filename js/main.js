document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('menu');

    menuToggle.addEventListener('click', () => {
        menu.classList.toggle("hidden");
    });

    // Highlight the current page link
    const links = document.querySelectorAll("nav a");

    // get current filename (e.g. "about.html")
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    links.forEach(link => {
        const linkPage = link.getAttribute("href");
        if (linkPage === currentPage) {
        link.classList.add("active");
    }
  });
});