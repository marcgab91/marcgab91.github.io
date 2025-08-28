async function loadHTML(file, targetId) {
    try {
        const response = await fetch(file);
        if (!response.ok) {
            throw new Error(`Failed to load ${file}: ${response.statusText}`);
        }
        const htmlContent = await response.text();
        document.getElementById(targetId).innerHTML = htmlContent;
    } catch (error) {
        console.error("Error loading html content:", error);
        document.getElementById(targetId).innerHTML = `<p style="color:red;">Failed to load content.</p>`;
    }
}