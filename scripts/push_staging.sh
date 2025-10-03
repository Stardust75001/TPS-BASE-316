#!/usr/bin/env bash
set -euo pipefail

STORE_SLUG=${SHOPIFY_CLI_STORE:-f6d72e-0f}
THEME_NAME=${THEME_NAME:-Copy of tps-base}

REPO_ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$REPO_ROOT"

if ! command -v shopify >/dev/null 2>&1; then
  echo "shopify CLI introuvable" >&2
  exit 1
fi

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
GET_ID_SCRIPT="$SCRIPT_DIR/get_theme_id.sh"
[ ! -x "$GET_ID_SCRIPT" ] && chmod +x "$GET_ID_SCRIPT"

STAGING_ID=$("$GET_ID_SCRIPT" "$THEME_NAME" "$STORE_SLUG")

if [ $# -gt 0 ]; then
  echo "> Push ciblé vers thème $STAGING_ID ($THEME_NAME)"
  shopify theme push --store "$STORE_SLUG" --theme "$STAGING_ID" --only "$@"
else
  echo "> Push complet vers thème $STAGING_ID ($THEME_NAME)"
  shopify theme push --store "$STORE_SLUG" --theme "$STAGING_ID"
fi
