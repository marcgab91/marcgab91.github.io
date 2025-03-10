document.addEventListener("DOMContentLoaded", function() {
    fetch('bottom-nav.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('bottom-nav-placeholder').innerHTML = data;
        });
});