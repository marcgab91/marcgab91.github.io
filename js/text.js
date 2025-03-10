document.addEventListener("DOMContentLoaded", function() {
    fetch('../content/text.txt')
        .then(response => response.text())
        .then(data => {
            document.getElementById('text-content').innerText = data;
        });
});