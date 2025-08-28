document.addEventListener("DOMContentLoaded", () => {
  const authContainer = document.querySelector(".auth-container");
  const passwordInput = document.querySelector(".password-input");
  const loginBtn = document.querySelector(".login-btn");
  const lockedContent = document.querySelector(".locked-content");
  const errorDiv = document.querySelector(".error-message");

  loadEncryptedContent();

  function loadEncryptedContent() {
    const script = document.createElement('script');
    script.src = '/js/encrypted/index.js';
    script.onload = () => {
      console.log('Verschlüsselte Inhalte geladen:', window.protectedPages?.length || 0);
      const storedPass = sessionStorage.getItem("auth-password");
      if (sessionStorage.getItem("auth") === "true" && storedPass) {
        onLoginSuccess();
      }
    };
    document.head.appendChild(script);
  }

  function onLoginSuccess() {
    authContainer.style.display = "none";
    lockedContent.style.display = "block";
    
    displayProtectedContent();
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

  function tryDecrypt(encryptedContent, password) {
    try {
      if (typeof CryptoJS !== 'undefined') {
        const decrypted = CryptoJS.AES.decrypt(encryptedContent, password).toString(CryptoJS.enc.Utf8);
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

    const password = sessionStorage.getItem('auth-password');
    let contentHtml = '';

    for (const page of window.protectedPages) {
      try {
        const response = await fetch(`/js/encrypted/${page.encrypted.replace(/\.[^.]*$/, '.js')}`);
        if (response.ok) {
          const scriptText = await response.text();
          eval(scriptText);
          
          const encryptedContent = window.encryptedContent?.[page.path];
          if (encryptedContent) {
            const decrypted = tryDecrypt(encryptedContent, password);
            if (decrypted) {
              contentHtml += `<div>${decrypted}</div>`;
            } else {
              contentHtml += `<p>Fehler beim Entschlüsseln von ${page.title}</p>`;
            }
          }
        }
      } catch (e) {
        console.error(`Fehler beim Laden von ${page.path}:`, e);
      }
    }

    lockedContent.innerHTML = contentHtml;

    document.querySelectorAll("[data-load-html]").forEach(el => {
      const file = el.getAttribute("data-load-html");
      loadHTML(file, el.id);
    });
  }

  const storedPass = sessionStorage.getItem("auth-password");
  if (sessionStorage.getItem("auth") === "true" && storedPass) {
    onLoginSuccess();
  } else {
    showLogin();
  }

  function attemptLogin() {
    const enteredPass = passwordInput.value.trim();
    
    if (!enteredPass) {
      showError("Bitte Passwort eingeben");
      return;
    }

    if (window.protectedPages && window.protectedPages.length > 0) {
      testDecryption(enteredPass).then(isValid => {
        if (isValid) {
          sessionStorage.setItem("auth", "true");
          sessionStorage.setItem("auth-password", enteredPass);
          onLoginSuccess();
        } else {
          showError("Falsches Passwort!");
        }
      });
    } else {
      showError("Geschützte Inhalte noch nicht geladen. Bitte versuchen Sie es erneut.");
    }
  }

  async function testDecryption(password) {
    if (!window.protectedPages || window.protectedPages.length === 0) {
      return false;
    }

    try {
      const firstPage = window.protectedPages[0];
      const response = await fetch(`/js/encrypted/${firstPage.encrypted.replace(/\.[^.]*$/, '.js')}`);
      
      if (response.ok) {
        const scriptText = await response.text();
        eval(scriptText);
        
        const encryptedContent = window.encryptedContent?.[firstPage.path];
        if (encryptedContent) {
          const decrypted = tryDecrypt(encryptedContent, password);
          return decrypted && decrypted.length > 0;
        }
      }
    } catch (e) {
      console.error('Fehler beim Testen der Entschlüsselung:', e);
    }
    
    return false;
  }

  loginBtn.addEventListener("click", attemptLogin);

  passwordInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      attemptLogin();
    }
  });

  window.logout = function() {
    sessionStorage.removeItem("auth");
    sessionStorage.removeItem("auth-password");
    showLogin();
  };
});
