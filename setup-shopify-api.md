# 🔧 CONFIGURATION API SHOPIFY POUR IMPORT COULEURS

## 🎯 ÉTAPE 1: Créer une App Privée Shopify

### 1. Allez dans votre Admin Shopify
URL: https://admin.shopify.com/store/f6d72e-0f/settings/apps

### 2. Développer des apps pour votre store
- Cliquez "Développer des apps pour votre store"
- Ou "Manage private apps" si disponible

### 3. Créer une nouvelle app
- Nom: "Color Import API"  
- Contact: votre email

### 4. Configurer les permissions API
**Admin API access tokens:**
- ✅ **write_products** (pour metaobjects)
- ✅ **read_products** (pour lecture)  
- ✅ **write_metaobjects** (si disponible)
- ✅ **read_metaobjects** (si disponible)

### 5. Récupérer le token
- Installez l'app
- Copiez "Admin API access token"

## 🔐 SÉCURITÉ
- Token = mot de passe → gardez-le secret
- Utilisez uniquement pour l'import
- Supprimez l'app après usage si besoin

## �� UTILISATION
Une fois le token obtenu, revenez ici avec le token !
