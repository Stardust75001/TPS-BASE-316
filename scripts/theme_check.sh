#!/usr/bin/env bash
set -euo pipefail
if [[ "${SKIP_THEME_CHECK:-}" == "1" ]]; then
  echo "[theme_check] skipped"; exit 0; fi
if ! command -v theme-check >/dev/null 2>&1; then
  gem install theme-check --no-document >/dev/null
fi
theme-check . "$@"
