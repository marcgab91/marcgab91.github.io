const CryptoJS = require('crypto-js');
const fs = require('fs');
const path = require('path');

const password = process.env.ENCRYPTION_PASSWORD;
if (!password) {
  console.error("Fehler: ENCRYPTION_PASSWORD nicht gesetzt");
  process.exit(1);
}

const protectedDir = './protected';
const outputDir = './js/encrypted';

// Output-Verzeichnis erstellen
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Verschlüsseln einer Datei
function encryptFile(filePath, relativePath) {
  // Datei als Buffer lesen (binär-kompatibel)
  const buffer = fs.readFileSync(filePath);
  
  // Buffer in WordArray konvertieren
  const wordArray = CryptoJS.lib.WordArray.create(buffer);
  
  // Verschlüsseln und Base64 erzeugen
  const encrypted = CryptoJS.AES.encrypt(wordArray, password).toString();

  const jsContent = `
// Automatisch generiert - nicht bearbeiten!
window.encryptedContent = window.encryptedContent || {};
window.encryptedContent['${relativePath}'] = '${encrypted}';
  `.trim();

  const outputFile = path.join(
    outputDir,
    relativePath.replace(/[\/\\]/g, '_').replace(/\.[^.]*$/, '.js')
  );
  fs.writeFileSync(outputFile, jsContent);
  console.log(`Verschlüsselt: ${relativePath} -> ${outputFile}`);
}

// Verzeichnis rekursiv durchsuchen
function processDirectory(dir, baseDir = dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath, baseDir);
    } else {
      const relativePath = path.relative(baseDir, fullPath);
      encryptFile(fullPath, relativePath);
    }
  });
}

if (fs.existsSync(protectedDir)) {
  processDirectory(protectedDir);
  console.log('✅ Verschlüsselung abgeschlossen!');
} else {
  console.log('⚠ Kein protected/ Verzeichnis gefunden');
}
