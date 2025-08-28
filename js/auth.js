// js/auth.js - Version mit automatischem Laden nach Seitenwechsel
document.addEventListener("DOMContentLoaded", () => {
  const authContainer = document.querySelector(".auth-container");
  const passwordInput = document.querySelector(".password-input");
  const loginBtn = document.querySelector(".login-btn");
  const lockedContent = document.querySelector(".locked-content");
  const errorDiv = document.querySelector(".error-message");

  // Session Storage
  const password = sessionStorage.getItem("auth-password");
  const isLoggedIn = sessionStorage.getItem("auth") === "true";

  // Lade Index + Inhalte
  loadEncryptedContent();

  async function loadEncryptedContent() {
    const script = document.createElement('script');
    script.src = '/js/encrypted/index.js';
    script.onload = async () => {
      console.log('Verschlüsselte Inhalte geladen:', window.protectedPages?.length || 0);

      if (isLoggedIn && password) {
        await displayProtectedContent();
        authContainer.style.display = "none";
        lockedContent.style.display = "block";
      } else {
        showLogin();
      }
    };
    document.head.appendChild(script);
  }

  function showLogin() {
    authContainer.style.display = "block";
    lockedContent.style.display = "none";
    if (errorDiv) errorDiv.style.display = "none";
  }

  function showError(message) {
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = "block";
    }
    passwordInput.value = "";
  }

  function tryDecrypt(encryptedContent, pwd) {
    try {
      if (typeof CryptoJS !== 'undefined') {
        const decrypted = CryptoJS.AES.decrypt(encryptedContent, pwd).toString(CryptoJS.enc.Utf8);
        return decrypted && decrypted.length > 0 ? decrypted : null;
      }
    } catch (e) {
      console.error('Entschlüsselungsfehler:', e);
    }
    return null;
  }

  async function displayProtectedContent() {
    if (!window.protectedPages || window.protectedPages.length === 0) {
      lockedContent.innerHTML = '<p>Keine geschützten Inhalte verfügbar.</p>';
      return;
    }

    let contentHtml = '';
    window.encryptedContent = window.encryptedContent || {};

    for (const page of window.protectedPages) {
      try {
        // Falls die verschlüsselte Datei noch nicht geladen ist
        if (!window.encryptedContent[page.path]) {
          const response = await fetch(`/js/encrypted/${page.encrypted.replace(/\.[^.]*$/, '.js')}`);
          if (response.ok) {
            const scriptText = await response.text();
            eval(scriptText);
          }
        }

        const encryptedContent = window.encryptedContent?.[page.path];
        if (encryptedContent) {
          const decrypted = tryDecrypt(encryptedContent, password);
          if (decrypted) {
            contentHtml += `<div>${decrypted}</div>`;
          } else {
            contentHtml += `<p>Fehler beim Entschlüsseln von ${page.title}</p>`;
          }
        }
      } catch (e) {
        console.error(`Fehler beim Laden von ${page.path}:`, e);
      }
    }

    lockedContent.innerHTML = contentHtml;
  }

  async function attemptLogin() {
    const enteredPass = passwordInput.value.trim();
    if (!enteredPass) {
      showError("Bitte Passwort eingeben");
      return;
    }

    if (window.protectedPages && window.protectedPages.length > 0) {
      const firstPage = window.protectedPages[0];
      try {
        const response = await fetch(`/js/encrypted/${firstPage.encrypted.replace(/\.[^.]*$/, '.js')}`);
        if (response.ok) {
          const scriptText = await response.text();
          eval(scriptText);

          const encryptedContent = window.encryptedContent?.[firstPage.path];
          const decrypted = tryDecrypt(encryptedContent, enteredPass);
          if (decrypted) {
            sessionStorage.setItem("auth", "true");
            sessionStorage.setItem("auth-password", enteredPass);
            await displayProtectedContent();
            authContainer.style.display = "none";
            lockedContent.style.display = "block";
            return;
          }
        }
      } catch (e) {
        console.error('Fehler beim Testen der Entschlüsselung:', e);
      }
    }
    showError("Falsches Passwort!");
  }

  loginBtn.addEventListener("click", attemptLogin);
  passwordInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") attemptLogin();
  });

  // Logout
  window.logout = function() {
    sessionStorage.removeItem("auth");
    sessionStorage.removeItem("auth-password");
    showLogin();
  };
});
