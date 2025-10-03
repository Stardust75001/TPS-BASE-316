#!/usr/bin/env bash
set -euo pipefail
# Package Shopify theme into a clean ZIP.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "$REPO_ROOT"

timestamp=$(date +%Y%m%d-%H%M%S)
base_name=${THEME_PACKAGE_NAME:-theme}
mkdir -p dist
OUTPUT_ZIP="${1:-dist/${base_name}-${timestamp}.zip}"

include_dirs=(assets config layout locales sections snippets templates)
present=()
for d in "${include_dirs[@]}"; do
  [ -d "$d" ] && present+=("$d")
done
[ ${#present[@]} -eq 0 ] && { echo "Aucun répertoire thème trouvé"; exit 1; }

echo "Creating ZIP: $OUTPUT_ZIP"
rm -f "$OUTPUT_ZIP"

excludes=(
  "**/.DS_Store" "**/.git/**" "**/.gitignore" "**/.github/**"
  "**/node_modules/**" "**/tests/**" "**/test/**" "**/docs/**"
  "**/.vscode/**" "**/.idea/**"
)

zip -r "$OUTPUT_ZIP" "${present[@]}" $(printf ' -x %q' "${excludes[@]}")
echo "Done: $(pwd)/$OUTPUT_ZIP"
