// js/auth.js - Neue Version mit verschlüsselten Inhalten
document.addEventListener("DOMContentLoaded", () => {
  sessionStorage.removeItem("auth");
  sessionStorage.removeItem("auth-password");
  
  showLogin();
  
  const authContainer = document.querySelector(".auth-container");
  const passwordInput = document.querySelector(".password-input");
  const loginBtn = document.querySelector(".login-btn");
  const lockedContent = document.querySelector(".locked-content");
  const errorDiv = document.querySelector(".error-message");

  // Lade verschlüsselte Inhalte
  loadEncryptedContent();

  function loadEncryptedContent() {
    // Lade Index der geschützten Seiten
    const script = document.createElement('script');
    script.src = '/js/encrypted/index.js';
    script.onload = () => {
      console.log('Verschlüsselte Inhalte geladen:', window.protectedPages?.length || 0);
    };
    document.head.appendChild(script);
  }

  function onLoginSuccess() {
    authContainer.style.display = "none";
    lockedContent.style.display = "block";
    
    // Lade und entschlüssele Inhalte
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
      // Verwende CryptoJS falls verfügbar
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
        // Lade verschlüsselte Datei
        const response = await fetch(`/js/encrypted/${page.encrypted.replace(/\.[^.]*$/, '.js')}`);
        if (response.ok) {
          const scriptText = await response.text();
          
          // Führe Script aus um encryptedContent zu setzen
          eval(scriptText);
          
          const encryptedContent = window.encryptedContent?.[page.path];
          if (encryptedContent) {
            const decrypted = tryDecrypt(encryptedContent, password);
            if (decrypted) {
              contentHtml += `
                  <div>${decrypted}</div>
              `;
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
  }

  // Prüfe Session Storage
  if (sessionStorage.getItem("auth") === "true") {
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

    // Teste Entschlüsselung mit einem Beispiel-Inhalt
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
      // Fallback wenn keine geschützten Seiten geladen
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

  // Event Listeners
  loginBtn.addEventListener("click", attemptLogin);

  passwordInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      attemptLogin();
    }
  });

  // Logout-Funktion
  window.logout = function() {
    sessionStorage.removeItem("auth");
    sessionStorage.removeItem("auth-password");
    showLogin();
  };
});