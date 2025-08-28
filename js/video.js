document.addEventListener("DOMContentLoaded", function() {
    const previewsContainer = document.getElementById('video-previews');
    const videoPlayer = document.getElementById('video-player');
    const videolistButtons = document.querySelectorAll('.videolist-button');

    function loadPreviews(videolist, videoPreviews) {
        previewsContainer.innerHTML = '';
        videoPreviews[videolist].forEach(video => {
            const previewDiv = document.createElement('div');
            previewDiv.classList.add('video-preview');
            previewDiv.innerHTML = `
                <img src="https://img.youtube.com/vi/${video.id}/0.jpg" alt="${video.title}" data-video-id="${video.id}">
                <div class="video-title">${video.title}</div>
            `;
            previewsContainer.appendChild(previewDiv);
        });

        // Add click event listeners to the new previews
        const previews = document.querySelectorAll('.video-previews img');
        previews.forEach(preview => {
            preview.addEventListener('click', function() {
                const videoId = this.getAttribute('data-video-id');
                videoPlayer.innerHTML = `<iframe class="embedded-video" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
            });
        });

        // Automatically load the first video
        if (videoPreviews[videolist].length > 0) {
            const firstVideoId = videoPreviews[videolist][0].id;
            videoPlayer.innerHTML = `<iframe class="embedded-video" src="https://www.youtube.com/embed/${firstVideoId}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        }
    }

    // Fetch video data from JSON file
    fetch('/content/watch/videos.json')
        .then(response => response.json())
        .then(videoPreviews => {
            // Load previews for Videolist 1 by default
            loadPreviews("Atemregulation", videoPreviews);

            // Add click event listeners to the videolist buttons
            videolistButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const videolist = this.getAttribute('data-videolist');
                    loadPreviews(videolist, videoPreviews);
                });
            });
        })
        .catch(error => console.error('Error loading video previews:', error));
});