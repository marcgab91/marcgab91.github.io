document.addEventListener("DOMContentLoaded", function () {
    const readMoreButtons = document.querySelectorAll(".exp-box .read-more-btn");

    readMoreButtons.forEach((button) => {
        button.addEventListener("click", function () {
            const box = button.closest(".exp-box");
            const hiddenContent = box.querySelector(".hidden-content");

            if (hiddenContent.style.display === "none" || hiddenContent.style.display === "") {
                hiddenContent.style.display = "inline"; // Show the hidden content
                button.textContent = "Read less..."; // Update button text
            } else {
                hiddenContent.style.display = "none"; // Hide the hidden content
                button.textContent = "Read more..."; // Reset button text
            }
        });
    });
});