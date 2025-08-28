document.addEventListener("DOMContentLoaded", function() {
    const images = [
        "/content/recovery/PerformanceHealth_Frauen1Fbb_1.png",
        "/content/recovery/PerformanceHealth_Frauen1Fbb_2.png"
    ];
    let current = 0;

    function showImage(idx) {
        document.querySelector(".slideshow-img").src = images[idx];
    }

    document.querySelector(".slide-left").onclick = function() {
        if (current > 0) {
            current--;
            showImage(current);
        }
    };
    document.querySelector(".slide-right").onclick = function() {
        if (current < images.length - 1) {
            current++;
            showImage(current);
        }
    };
});