# Sentry Releases for Shopify Theme

This theme tags every event with a release: `{{ shop.permanent_domain }}:{{ theme.id }}`. To see deploys and adoption in Sentry Releases/Health, announce a release each time you publish the theme.

## Option A — sentry-cli

1. Install

```bash
brew install getsentry/tools/sentry-cli
```

1. Configure env (replace values)

```bash
export SENTRY_AUTH_TOKEN=YOUR_TOKEN
export SENTRY_ORG=falcon-trading-ep
export SENTRY_PROJECT=tps-base
export RELEASE="yourshop.myshopify.com:THEME_ID"
export ENVIRONMENT=production
```

1. Create/finalize + deploy

```bash
sentry-cli --org "$SENTRY_ORG" --project "$SENTRY_PROJECT" releases new "$RELEASE" || true
sentry-cli --org "$SENTRY_ORG" releases finalize "$RELEASE"
sentry-cli --org "$SENTRY_ORG" --project "$SENTRY_PROJECT" releases deploys "$RELEASE" new -e "$ENVIRONMENT"
```

Shortcut: use the helper script

```bash
scripts/sentry-release.sh "yourshop.myshopify.com:THEME_ID"
```

Requires the env vars above to be set.

## Option B — Webhook (no CLI)

Use the project’s Releases webhook (Project → Versions/Deploy → Webhook) with payload:

```bash
curl https://de.sentry.io/api/hooks/release/builtin/.... \
  -X POST \
  -H 'Content-Type: application/json' \
  -d '{"version": "yourshop.myshopify.com:THEME_ID", "projects": ["tps-base"], "environment": "production"}'
```

## Tips

- Keep the `RELEASE` string identical to what the frontend sends.
- You can use your theme name/version instead, but keep it stable across deploys.
- For RAW, change `SENTRY_PROJECT` accordingly.
- Prefer EU endpoints/domains for webhooks (e.g., `de.sentry.io`).
