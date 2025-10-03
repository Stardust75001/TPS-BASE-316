# TPS-BASE (Shopify theme)

## Scripts
- Dev : `shopify theme dev`
- QA  : `npm run qa`  (Theme Check + ESLint + Stylelint + Locales)
- Perf: `npm run perf` (Lighthouse CI)

## Déploiement
1. `shopify theme push` sur un thème **de préprod**
2. QA manuelle, puis **Publish** dans l’Admin

## Sécurité
- Ne commitez jamais `.env` (utilisez `.env.example`)
- Faites rotate des tokens Shopify si exposés

# ci: touch
// tweak
