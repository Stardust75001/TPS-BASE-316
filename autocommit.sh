# se placer dans le dossier du script
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# charger le .env local s'il existe
[ -f ".env" ] && set -a && . ./.env && set +a

# log de contrôle
mkdir -p .logs
echo "[$(date '+%Y-%m-%d %H:%M:%S')] autocommit lancé dans $(pwd) THEME_ID=${THEME_ID:-unset}" >> .logs/autocommit.log

#!/usr/bin/env bash
set -euo pipefail

LOG_DIR=".logs"
LOG_FILE="$LOG_DIR/autocommit.log"
PID_FILE="$LOG_DIR/autocommit.pid"

mkdir -p "$LOG_DIR"
touch "$LOG_FILE"

# --- Lock: empêche plusieurs watchers ---
if [ -f "$PID_FILE" ] && ps -p "$(cat "$PID_FILE")" >/dev/null 2>&1; then
  echo "⚠️  Déjà en cours (PID $(cat "$PID_FILE")). Quit."
  exit 0
fi
echo $$ > "$PID_FILE"
cleanup() { rm -f "$PID_FILE"; }
trap cleanup EXIT INT TERM

# --- Notifications ---
notify() {
  local msg="$1"
  if command -v osascript >/dev/null; then
    osascript -e 'display notification "'"$msg"'" with title "AutoCommit (dev+main)"'
  fi
  [ -f /System/Library/Sounds/Pop.aiff ] && afplay /System/Library/Sounds/Pop.aiff >/dev/null 2>&1 || true
}

# --- Log to file + console ---
exec > >(tee -a "$LOG_FILE") 2>&1
echo "——— $(date +'%F %T') · Auto-commit démarré ———"

command -v fswatch >/dev/null || { echo "❌ fswatch introuvable (brew install fswatch)"; exit 1; }
git rev-parse --is-inside-work-tree >/dev/null || { echo "❌ Pas dans un repo Git"; exit 1; }

while fswatch -1 -o . \
  --exclude '\.git' \
  --exclude 'node_modules' \
  --exclude '\.logs' \
  >/dev/null; do

  CURR_BRANCH="$(git rev-parse --abbrev-ref HEAD || echo '')"
  MSG="chore:auto-commit $(date +'%F %T')"

  if git diff --quiet && git diff --cached --quiet; then
    echo "ℹ️  $(date +'%T') Rien à committer."
    continue
  fi

  echo "📝 $(date +'%T') Commit sur branche courante: ${CURR_BRANCH:-?}"
  git add -A || true
  git commit -m "$MSG" || echo "ℹ️  Aucun nouveau commit."

  if [ -n "$CURR_BRANCH" ] && [ "$CURR_BRANCH" != "HEAD" ]; then
    git fetch origin || true
    if ! git pull --rebase origin "$CURR_BRANCH"; then
      echo "⚠️  Conflit de rebase sur origin/$CURR_BRANCH."
      notify "Rebase échoué sur $CURR_BRANCH — corrige les conflits"
      continue
    fi
  fi

  echo "🚀 $(date +'%T') Push atomique vers origin:{dev,main}"
  if git push --atomic origin HEAD:dev HEAD:main; then
    echo "✅ $(date +'%T') Poussé sur dev & main : $MSG"
    notify "Commit poussé ✅"
  else
    echo "❌ $(date +'%T') Push atomique refusé (non fast-forward)."
    echo "   ➤ Merge/cherry-pick manuellement, puis relance."
    notify "Push refusé ❌ (non fast-forward)"
  fi
done

# --- single-instance lock (portable, sans flock) ---
mkdir -p .logs
LOCKDIR=".logs/lock"
if mkdir "$LOCKDIR" 2>/dev/null; then
  trap 'rmdir "$LOCKDIR"' EXIT INT TERM
else
  echo "🔒 Déjà en cours dans $(pwd)"
  exit 0
fi
