# 🔧 Gestion Centralisée des Analytics

Ce système permet de centraliser la configuration des IDs et tokens d'analytics dans un fichier de variables d'environnement, comme pour les secrets et tokens sensibles.

## 📁 Architecture

```
📦 TPS-BASE-316/
├── 📄 .env.example                    # Template des variables d'environnement
├── 📄 .env                           # Vos vraies valeurs (non commité)
├── 📄 analytics-env-injector.js       # Script d'injection des variables
├── 📄 assets/analytics-config.js      # Classe de gestion de config
├── 📄 snippets/analytics-config.liquid # Configuration Liquid centralisée
└── 📄 snippets/analytics-tracking.liquid # Services de tracking
```

## 🚀 Installation et Configuration

### 1. Créer le fichier d'environnement

```bash
# Copier le template
npm run env:setup

# Ou manuellement
cp .env.example .env
```

### 2. Configurer vos variables

Éditez le fichier `.env` avec vos vraies valeurs :

```bash
# Google Tag Manager
GTM_CONTAINER_ID=GTM-ABC123

# Google Analytics 4
GA4_MEASUREMENT_ID=G-XXXXXXXXXX

# Webmaster Tools
GOOGLE_SITE_VERIFICATION=abc123def456
AHREFS_SITE_VERIFICATION=xyz789

# Social Media
FACEBOOK_PIXEL_ID=123456789012345

# Security
TURNSTILE_SITE_KEY=0x4AAAAAAAAAAAAAAAAAAAAAA
TURNSTILE_ENABLED=true
TURNSTILE_THEME=auto
TURNSTILE_SIZE=normal
```

### 3. Valider la configuration

```bash
npm run analytics:validate
```

### 4. Injecter dans le thème (optionnel)

```bash
npm run analytics:inject
```

## 🔄 Méthodes de Configuration

### Méthode 1: Variables d'Environnement (Recommandée)

Avantages :
- ✅ Centralisé dans `.env`
- ✅ Sécurisé (pas de commit)
- ✅ Facile à gérer par environnement
- ✅ Validation automatique

### Méthode 2: Settings Shopify Theme

Avantages :
- ✅ Interface graphique
- ✅ Changement en temps réel
- ✅ Pas besoin de redéploiement

### Méthode 3: Hybride (Les deux)

La configuration Shopify **prend priorité** sur les variables d'environnement.

## 📋 Scripts Disponibles

```bash
# Configuration
npm run env:setup          # Créer le fichier .env
npm run analytics:validate # Valider les variables
npm run analytics:inject   # Injecter dans le thème

# Développement
npm run dev               # Démarrer en mode développement
npm run build            # Build de production
```

## 🔧 Utilisation dans le Code

### JavaScript (Client)

```javascript
// Configuration automatiquement disponible
const config = window.analyticsConfig;

// Vérifier si un service est activé
if (config.isServiceEnabled('gtm')) {
  // GTM est configuré
}

// Récupérer une valeur
const gtmId = config.get('gtm_id');

// Debug conditionnel
config.debug('Message de debug');
```

### Liquid (Shopify)

```liquid
{% comment %} La configuration est automatiquement chargée {% endcomment %}

{% if settings.gtm_id != blank %}
  <!-- GTM configuré -->
  <script>
    gtag('config', '{{ settings.gtm_id }}');
  </script>
{% endif %}
```

### Node.js (Build)

```javascript
const { analyticsConfig } = require('./assets/analytics-config.js');

// Utiliser la configuration
const gtmId = analyticsConfig.get('GTM_CONTAINER_ID');
```

## 🔍 Variables Supportées

| Variable Env | Setting Shopify | Description |
|--------------|----------------|-------------|
| `GTM_CONTAINER_ID` | `gtm_id` | ID conteneur Google Tag Manager |
| `GA4_MEASUREMENT_ID` | `ga4_id` | ID mesure Google Analytics 4 |
| `GOOGLE_SITE_VERIFICATION` | `google_site_verification` | Code vérification Search Console |
| `AHREFS_SITE_VERIFICATION` | `ahrefs_site_verification` | Code vérification Ahrefs |
| `FACEBOOK_PIXEL_ID` | `facebook_pixel_id` | ID Pixel Facebook/Meta |
| `TURNSTILE_SITE_KEY` | `turnstile_site_key` | Clé publique Turnstile |
| `TURNSTILE_ENABLED` | `turnstile_enabled` | Activer Turnstile |
| `TURNSTILE_THEME` | `turnstile_theme` | Thème Turnstile |
| `TURNSTILE_SIZE` | `turnstile_size` | Taille Turnstile |

## 🚨 Sécurité et Bonnes Pratiques

### Fichier .env

- ❌ **Jamais** commiter le fichier `.env`
- ✅ Toujours utiliser `.env.example` comme template
- ✅ Ajouter `.env` au `.gitignore`
- ✅ Utiliser des valeurs factices dans `.env.example`

### Variables Sensibles

Les **clés publiques** peuvent être dans le code :
- ✅ GTM Container ID
- ✅ GA4 Measurement ID
- ✅ Facebook Pixel ID
- ✅ Turnstile Site Key

Les **clés privées** doivent rester secrètes :
- ❌ Turnstile Secret Key (serveur seulement)
- ❌ Clés API privées

### Environnements

Utilisez des configurations différentes par environnement :

```bash
# Développement
GTM_CONTAINER_ID=GTM-DEV123
DEBUG_MODE=true

# Production
GTM_CONTAINER_ID=GTM-PROD456
DEBUG_MODE=false
```

## 📊 Avantages du Système

1. **Centralisation** : Toutes les configurations au même endroit
2. **Sécurité** : Variables sensibles hors du code
3. **Flexibilité** : Support multi-environnement
4. **Validation** : Vérification automatique des formats
5. **Fallback** : Settings Shopify en backup
6. **Debug** : Logs conditionnels pour le développement

## 🔄 Migration depuis l'Ancien Système

1. Garder les settings Shopify actuels (compatibilité)
2. Ajouter les variables d'environnement progressivement
3. Tester en mode debug
4. Supprimer les anciennes configurations quand prêt

## ⚡ Performance

- Configuration chargée une seule fois au début
- Pas d'impact sur les performances
- Cache automatique des valeurs
- Validation minimale en production
