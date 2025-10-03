#!/usr/bin/env bash
set -euo pipefail
# get_theme_id.sh – minimal, jq only, no sed/awk fallbacks.
# VERSION: 2025-09-17-minimal-jq-v1
# Usage: scripts/get_theme_id.sh "Theme Name" | <id>

need(){ command -v "$1" >/dev/null 2>&1 || { echo "$1 requis" >&2; exit 1; }; }
[ "${GET_THEME_ID_DEBUG:-}" = "1" ] && echo "[get_theme_id] Version 2025-09-17-minimal-jq-v1" >&2
need shopify; need jq

read_var(){ grep -h -E "^$1=" .env.local .env 2>/dev/null | tail -n1 | cut -d= -f2- | tr -d '\r'; }

NAME_OR_ID="${1:-}"; [ -z "$NAME_OR_ID" ] && NAME_OR_ID="$(read_var STAGING_THEME_NAME || true)"
[ -z "$NAME_OR_ID" ] && { echo "Usage: $0 \"Theme Name\" | <id>" >&2; exit 2; }
[[ "$NAME_OR_ID" =~ ^[0-9]+$ ]] && { echo "$NAME_OR_ID"; exit 0; }

STORE_SLUG="${SHOPIFY_CLI_STORE:-$(read_var STORE || true)}"
[ -z "$STORE_SLUG" ] && { echo "STORE manquant" >&2; exit 3; }
STORE_SLUG="${STORE_SLUG%.myshopify.com}"

RAW=$(shopify theme list --store "$STORE_SLUG" --json 2>&1 || true)
ID=$(printf '%s' "$RAW" | jq -r --arg N "$NAME_OR_ID" '(.themes // .)[]? | select(.name==$N) | .id' | head -n1 || true)

if [ -z "$ID" ] || [ "$ID" = "null" ]; then
  echo "Nom introuvable: $NAME_OR_ID" >&2
  printf '%s' "$RAW" | jq -r '(.themes // .)[]? | "- \(.name) -> \(.id)"' >&2 || true
  exit 4
fi

echo "$ID"
