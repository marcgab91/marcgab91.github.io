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
    displayProtectedImages();
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

  function tryDecryptText(encryptedContent, password) {
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

  function tryDecryptBinary(encryptedContent, password) {
    try {
      if (typeof CryptoJS !== 'undefined') {
        const decrypted = CryptoJS.AES.decrypt(encryptedContent, password);
        const typedArray = Uint8Array.from(decrypted.words.map(w => [
          (w >> 24) & 0xff,
          (w >> 16) & 0xff,
          (w >> 8) & 0xff,
          w & 0xff
        ]).flat());
        return typedArray;
      }
    } catch (e) {
      console.error('Fehler beim Entschlüsseln von Binärdateien:', e);
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
            const decrypted = tryDecryptText(encryptedContent, password);
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
  }

  // Neue Funktion: Alle verschlüsselten Bilder dynamisch laden
  async function displayProtectedImages() {
    const password = sessionStorage.getItem('auth-password');
    if (!window.encryptedContent) return;

    const imgElements = document.querySelectorAll('img[data-protected]');
    for (const img of imgElements) {
      const fileKey = img.getAttribute('data-protected'); // z.B. "content/athletes/meinBild.png"
      const encrypted = window.encryptedContent[fileKey];
      if (encrypted) {
        const bytes = tryDecryptBinary(encrypted, password);
        if (bytes) {
          const blob = new Blob([bytes], { type: 'image/png' });
          const url = URL.createObjectURL(blob);
          img.src = url;
        } else {
          console.error('Fehler beim Entschlüsseln von Bild:', fileKey);
        }
      }
    }
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
          const decrypted = tryDecryptText(encryptedContent, password);
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
