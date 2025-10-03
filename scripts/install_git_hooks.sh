#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
HOOK_SRC_DIR="$SCRIPT_DIR/git-hooks"
GIT_HOOK_DIR="$REPO_ROOT/.git/hooks"

[ -d "$GIT_HOOK_DIR" ] || { echo "Pas de dossier .git/hooks"; exit 1; }

for hook in pre-push; do
  if [ -f "$HOOK_SRC_DIR/$hook" ]; then
    cp "$HOOK_SRC_DIR/$hook" "$GIT_HOOK_DIR/$hook"
    chmod +x "$GIT_HOOK_DIR/$hook"
    echo "Installé hook: $hook"
  fi
done
