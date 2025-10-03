#!/usr/bin/env bash
set -euo pipefail

if [[ ${1-} == "" ]]; then
  echo "Usage: $0 <RELEASE_VERSION>"
  echo "Example: $0 yourshop.myshopify.com:THEME_ID"
  exit 1
fi

: "${SENTRY_AUTH_TOKEN:?SENTRY_AUTH_TOKEN is required}"
: "${SENTRY_ORG:?SENTRY_ORG is required}"
: "${SENTRY_PROJECT:?SENTRY_PROJECT is required}"

RELEASE="$1"
ENVIRONMENT="${ENVIRONMENT:-production}"

echo "Creating/finalizing Sentry release: $RELEASE (env=$ENVIRONMENT, org=$SENTRY_ORG, project=$SENTRY_PROJECT)"

sentry-cli --org "$SENTRY_ORG" --project "$SENTRY_PROJECT" releases new "$RELEASE" || true
sentry-cli --org "$SENTRY_ORG" releases finalize "$RELEASE"
sentry-cli --org "$SENTRY_ORG" --project "$SENTRY_PROJECT" releases deploys "$RELEASE" new -e "$ENVIRONMENT"

echo "Done."
