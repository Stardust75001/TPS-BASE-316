# 📊 Guide de Configuration - Analytics & Tracking

Ce guide vous explique comment configurer tous les outils d'analytics et de tracking installés sur votre thème Shopify.

## 🎯 Nouveau : Configuration Centralisée

**🚀 Méthode recommandée** : Utilisez le système de variables d'environnement pour centraliser vos IDs !

```bash
# Setup automatique
npm run analytics:setup

# Ou setup manuel
npm run env:setup
# Puis éditer .env avec vos valeurs
```

📖 Voir `ANALYTICS-QUICKSTART.md` pour le guide rapide ou `README-ANALYTICS-CONFIG.md` pour la documentation complète.

## 🚀 Outils Installés

### ✅ Google Tag Manager (GTM)
- **Objectif** : Gestion centralisée de tous vos scripts de tracking
- **Configuration** : Admin Shopify > Thèmes > Personnaliser > Analytics & Tracking > GTM Container ID
- **Format ID** : `GTM-XXXXXXX`

### ✅ Google Analytics 4 (GA4)
- **Objectif** : Analytics détaillée avec ecommerce avancé
- **Configuration** : Admin Shopify > Thèmes > Personnaliser > Analytics & Tracking > GA4 Measurement ID
- **Format ID** : `G-XXXXXXXXXX`
- **Note** : Utilisé automatiquement comme fallback si GTM n'est pas configuré

### ✅ Google Search Console
- **Objectif** : Vérification de site pour le SEO et l'indexation Google
- **Configuration** : Admin Shopify > Thèmes > Personnaliser > Analytics & Tracking > Google Site Verification
- **Format** : Meta tag content (ex: `abc123def456`)

### ✅ Ahrefs Site Verification
- **Objectif** : Vérification pour l'outil SEO Ahrefs
- **Configuration** : Admin Shopify > Thèmes > Personnaliser > Analytics & Tracking > Ahrefs Site Verification
- **Format** : Code de vérification Ahrefs

### ✅ Facebook/Meta Pixel
- **Objectif** : Tracking pour publicités Facebook/Instagram
- **Configuration** : Admin Shopify > Thèmes > Personnaliser > Analytics & Tracking > Facebook Pixel ID
- **Format ID** : `123456789012345`

### ✅ Cloudflare Turnstile
- **Objectif** : Protection anti-bot pour formulaires
- **Configuration** : Admin Shopify > Thèmes > Personnaliser > Analytics & Tracking > Turnstile
- **Champs** :
  - Enable Turnstile : Activer/Désactiver
  - Site Key : Clé publique Cloudflare
  - Theme : auto/light/dark
  - Size : normal/compact

## 📋 Étapes de Configuration

### 1. Google Tag Manager (Recommandé)
1. Créez un compte GTM sur [tagmanager.google.com](https://tagmanager.google.com)
2. Créez un nouveau conteneur pour votre site
3. Copiez l'ID du conteneur (format GTM-XXXXXXX)
4. Dans Shopify : Personnaliser > Analytics & Tracking > saisissez l'ID GTM
5. Configurez vos tags dans GTM (GA4, Facebook Pixel, etc.)

### 2. Google Analytics 4 (si pas de GTM)
1. Créez une propriété GA4 sur [analytics.google.com](https://analytics.google.com)
2. Copiez le Measurement ID (format G-XXXXXXXXXX)
3. Dans Shopify : Personnaliser > Analytics & Tracking > saisissez l'ID GA4

### 3. Google Search Console
1. Allez sur [search.google.com/search-console](https://search.google.com/search-console)
2. Ajoutez votre propriété de site
3. Choisissez la méthode "Balise HTML"
4. Copiez le contenu de la balise meta (sans les guillemets)
5. Dans Shopify : Personnaliser > Analytics & Tracking > saisissez le code

### 4. Ahrefs Site Verification
1. Connectez-vous à votre compte Ahrefs
2. Allez dans Site Explorer > Vérifier le site
3. Copiez le code de vérification
4. Dans Shopify : Personnaliser > Analytics & Tracking > saisissez le code

### 5. Facebook/Meta Pixel
1. Allez sur [business.facebook.com](https://business.facebook.com)
2. Créez un pixel dans Events Manager
3. Copiez l'ID du pixel (nombre à 15 chiffres)
4. Dans Shopify : Personnaliser > Analytics & Tracking > saisissez l'ID

### 6. Cloudflare Turnstile
1. Créez un compte sur [cloudflare.com](https://cloudflare.com)
2. Allez dans Turnstile dans le dashboard
3. Créez un nouveau site
4. Copiez la Site Key (clé publique)
5. Dans Shopify : Personnaliser > Analytics & Tracking > activez Turnstile et saisissez la clé

## 🎯 Événements E-commerce Trackés

### Événements Google Analytics 4
- ✅ `page_view` : Vue de page automatique
- ✅ `view_item` : Vue produit (pages produit)
- ✅ `view_item_list` : Vue collection (pages collection)
- ✅ `add_to_cart` : Ajout au panier
- ✅ `remove_from_cart` : Retrait du panier
- ✅ `begin_checkout` : Début checkout
- ✅ `purchase` : Achat terminé

### Événements Facebook Pixel
- ✅ `PageView` : Vue de page automatique
- ✅ `ViewContent` : Vue produit
- ✅ `ViewCategory` : Vue collection
- ✅ `AddToCart` : Ajout au panier
- ✅ `InitiateCheckout` : Début checkout
- ✅ `Purchase` : Achat terminé

## 🛡️ Sécurité et Protection

### Formulaires Protégés par Turnstile
- ✅ Formulaire de contact
- ✅ Inscription newsletter
- 🔄 Protection automatique (bouton désactivé jusqu'à vérification)

### Protection Anti-Erreurs
- ✅ Filtrage automatique des erreurs 404 et MIME
- ✅ Gestion d'erreurs Sentry intégrée
- ✅ Fallbacks pour scripts manquants

## ⚡ Performance et Optimisation

### Chargement Conditionnel
- Scripts chargés uniquement si configurés
- Fallback GA4 si GTM non configuré
- Scripts defer/async pour performance optimale

### Tracking Ecommerce Avancé
- Données produit enrichies (ID, nom, catégorie, prix)
- Support multi-devises
- Validation automatique des données

## 🔧 Fichiers Modifiés

### Configuration Theme
- `config/settings_schema.json` : Nouvelle section Analytics & Tracking
- `layout/theme.liquid` : Integration des scripts
- `snippets/meta-tags.liquid` : Meta tags de vérification

### Snippets Analytics
- `snippets/analytics-tracking.liquid` : GTM, GA4, Meta Pixel
- `snippets/gtm-noscript.liquid` : Fallback GTM
- `snippets/turnstile.liquid` : Protection anti-bot

### Scripts et Assets
- `assets/ecommerce-tracking.js` : Tracking ecommerce avancé

### Formulaires Modifiés
- `sections/contact-form.liquid` : Protection Turnstile
- `sections/newsletter.liquid` : Protection Turnstile

## 🚨 Points d'Attention

1. **GTM vs GA4** : Si GTM est configuré, GA4 direct est désactivé automatiquement
2. **Turnstile** : Les formulaires sont désactivés jusqu'à vérification anti-bot
3. **RGPD** : Assurez-vous d'avoir les consentements nécessaires pour le tracking
4. **Test** : Vérifiez dans la console développeur que les événements se déclenchent

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez que les IDs sont correctement saisis (sans espaces)
2. Consultez la console développeur (F12) pour les erreurs
3. Testez sur un navigateur en mode incognito
4. Vérifiez que les services externes (GTM, GA4) sont bien configurés

---

**✨ Configuration terminée ! Votre thème dispose maintenant d'un système de tracking et d'analytics complet et professionnel.**
