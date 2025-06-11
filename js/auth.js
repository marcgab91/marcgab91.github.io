document.addEventListener("DOMContentLoaded", () => {
  const PASSWORD = "123"; // Passwort anpassen
  const authContainer = document.getElementById("auth-container");
  const passwordInput = document.getElementById("password-input");
  const loginBtn = document.getElementById("login-btn");
  const errorMessage = document.getElementById("error-message");
  const textContent = document.getElementById("text-content");

  function showContent() {
    authContainer.style.display = "none";
    textContent.style.display = "block";
  }

  function showLogin() {
    authContainer.style.display = "block";
    textContent.style.display = "none";
  }

  // Prüfen, ob bereits eingeloggt (SessionStorage)
  if (sessionStorage.getItem("auth") === "true") {
    showContent();
  } else {
    showLogin();
  }

  loginBtn.addEventListener("click", () => {
    const enteredPass = passwordInput.value;
    if (enteredPass === PASSWORD) {
      sessionStorage.setItem("auth", "true");
      showContent();
    } else {
      errorMessage.textContent = "Falsches Passwort!";
      passwordInput.value = "";
      passwordInput.focus();
    }
  });

  // Enter-Taste unterstützt auch
  passwordInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      loginBtn.click();
    }
  });
});
