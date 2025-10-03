#!/bin/bash
set -e

PROJECT="/Users/asc/TPS BASE ASSETS"

echo "→ Correction des permissions dans : $PROJECT"
cd "$PROJECT" || { echo "❌ Dossier introuvable"; exit 1; }

# 1) Retirer protections/attributs spéciaux sur assets/
sudo chflags -R nouchg,noschg "assets" || true
sudo xattr  -dr com.apple.quarantine "assets" || true

# 2) Redonner les bons droits à l’utilisateur courant
sudo chown -R "$USER":staff "assets" || true
chmod -R u+rwX "assets"

echo "✅ Permissions corrigées avec succès."
