#!/usr/bin/env bash
set -euo pipefail

FILE="layout/theme.liquid"
PLACEHOLDER='__BUILD_TAG__'

[ ! -f "$FILE" ] && { echo "Fichier $FILE introuvable" >&2; exit 1; }

HASH=$(git rev-parse --short=10 HEAD 2>/dev/null || echo NO_GIT)
DATE=$(date -u +%Y%m%dT%H%M%SZ)
TAG="${DATE}-${HASH}"

grep -q "$PLACEHOLDER" "$FILE" || { echo "Placeholder $PLACEHOLDER absent"; exit 2; }

# macOS sed
sed -i '' -e "s/$PLACEHOLDER/$TAG/" "$FILE"

echo "Build tag inséré: $TAG"
