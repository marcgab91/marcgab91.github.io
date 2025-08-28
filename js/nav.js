// Function to load the navbar
function loadNavbar() {
    return fetch('/pages/comp/nav.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('nav-placeholder').innerHTML = data;
        })
        .catch(error => console.error('Error loading navigation:', error));
}

// Function to set the active class based on the current path
function setActiveClass() {
    const currentPath = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');

    // Remove active class from all nav links
    navLinks.forEach(link => {
        link.classList.remove('active');
    });

    // Check if the current path is the root URL
    if (currentPath === '') {
        const indexLink = document.querySelector('.nav-link[href="/index.html"]');
        if (indexLink) {
            indexLink.classList.add('active');
        }
    } else {
        // Set the active class based on the current path
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.includes(currentPath)) {
                link.classList.add('active');
                // Check if the link is part of nav-second
                if (link.classList.contains('nav-second')) {
                    const parentNavButton = link.closest('.nav-button');
                    if (parentNavButton) {
                        const parentNavLink = parentNavButton.querySelector('.nav-link.nav-first');
                        if (parentNavLink) {
                            parentNavLink.classList.add('active');
                        }
                    }
                }
            }
        });
    }
}

// Load the navbar and set the active class once the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function() {
    loadNavbar().then(setActiveClass);
});

function toggleMenu() {
    const navLinks = document.querySelector('.nav-list');
    navLinks.classList.toggle('show');
}