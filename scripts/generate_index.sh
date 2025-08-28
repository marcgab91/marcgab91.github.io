#!/bin/bash
# generate-index.sh
# Erstellt das Index-File für verschlüsselte Seiten

set -e  # Skript bei Fehler abbrechen

# Index-Datei starten
echo "window.protectedPages = [" > js/encrypted/index.js

# Alle HTML- und MD-Dateien im protected-Verzeichnis eintragen
find protected -type f \( -name "*.html" -o -name "*.md" \) | while read file; do
  relative=$(echo "$file" | sed 's|^protected/||')
  title=$(basename "$file" .html)
  echo "  { path: '$relative', title: '$title', encrypted: '${relative//\//_}' }," >> js/encrypted/index.js
done

# Index-Datei abschließen
echo "];" >> js/encrypted/index.js

echo "✅ js/encrypted/index.js erfolgreich erstellt!"