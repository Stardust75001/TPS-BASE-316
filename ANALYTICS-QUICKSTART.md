# 🎯 Analytics Configuration - Quick Start

## ⚡ Setup Rapide

```bash
# 1. Setup automatisé (recommandé)
npm run analytics:setup

# 2. OU manual
npm run env:setup
# Puis éditer .env avec vos valeurs

# 3. Valider
npm run analytics:validate

# 4. (Optionnel) Injecter dans le thème
npm run analytics:inject
```

## 📋 Variables Principales

```bash
# .env
GTM_CONTAINER_ID=GTM-ABC123
GA4_MEASUREMENT_ID=G-XXXXXXXXXX
FACEBOOK_PIXEL_ID=123456789012345
TURNSTILE_SITE_KEY=0x4AAAAAAAAAA
TURNSTILE_ENABLED=true
```

## 🔧 Utilisation

### JavaScript
```javascript
// Configuration automatiquement disponible
if (window.analyticsConfig.isServiceEnabled('gtm')) {
  // GTM est configuré
  console.log('GTM ID:', window.analyticsConfig.gtm_id);
}
```

### Liquid
```liquid
{% if settings.gtm_id != blank %}
  <!-- GTM configuré via settings OU variables env -->
  <script>
    gtag('config', '{{ settings.gtm_id }}');
  </script>
{% endif %}
```

## 🚀 Avantages

- ✅ **Centralisé** : Toutes les configs dans `.env`
- ✅ **Sécurisé** : Pas de commit des secrets
- ✅ **Flexible** : Support multi-environnement
- ✅ **Validation** : Vérification automatique
- ✅ **Fallback** : Settings Shopify en backup

## 📊 Services Supportés

| Service | Variable Env | Setting Shopify |
|---------|--------------|-----------------|
| Google Tag Manager | `GTM_CONTAINER_ID` | `gtm_id` |
| Google Analytics 4 | `GA4_MEASUREMENT_ID` | `ga4_id` |
| Facebook Pixel | `FACEBOOK_PIXEL_ID` | `facebook_pixel_id` |
| Cloudflare Turnstile | `TURNSTILE_SITE_KEY` | `turnstile_site_key` |
| Google Search Console | `GOOGLE_SITE_VERIFICATION` | `google_site_verification` |
| Ahrefs | `AHREFS_SITE_VERIFICATION` | `ahrefs_site_verification` |

## 📖 Documentation Complète

Voir `README-ANALYTICS-CONFIG.md` pour tous les détails.
