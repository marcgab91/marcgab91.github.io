async function loadHTML(file, targetId) {
  try {
    const targetEl = document.getElementById(targetId);
    if (!targetEl) throw new Error(`Target element with id "${targetId}" not found`);

    const response = await fetch(file);
    if (!response.ok) {
      throw new Error(`Failed to load ${file}: ${response.statusText}`);
    }
    const htmlContent = await response.text();
    targetEl.innerHTML = htmlContent;
  } catch (error) {
    console.error("Error loading html content:", error);
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      targetEl.innerHTML = `<p style="color:red;">Failed to load content.</p>`;
    }
  }
}