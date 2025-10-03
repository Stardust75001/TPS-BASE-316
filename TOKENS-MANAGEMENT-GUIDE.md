# 🔐 GUIDE COMPLET: GESTION CENTRALISÉE DES TOKENS

## 🚨 SITUATION ACTUELLE - ACTION IMMÉDIATE REQUISE

Vous avez **13+ tokens Shopify dispersés** dans vos notes. **TOUS doivent être révoqués immédiatement** pour sécurité !

### 🔥 Tokens à Révoquer Immédiatement

| Token (Début) | Usage | Status |
|---------------|--------|--------|
| `shpat_ec80...` | Color Import API | ❌ **EXPOSÉ PUBLIQUEMENT** |
| `shpat_bc73...` | Admin Token Ancien | ⚠️ À révoquer |
| `shpat_a1a3...` | TPS BASE PANTONE | ⚠️ À révoquer |
| `shpat_9394...` | CLI Exports | ⚠️ À révoquer |
| `shptka_7fb...` | Theme Access | ⚠️ À révoquer |
| `shptka_fa39...` | Theme f6d72e-0f | ⚠️ À révoquer |
| **+ 7 autres** | Divers usages | ⚠️ À révoquer |

## 🛠️ SOLUTION: SYSTÈME CENTRALISÉ

### 1. Migration Automatique

```bash
# Lancer la migration complète
./migrate-tokens.sh
```

**Ce script va :**
- ✅ Créer un fichier `.env` centralisé
- ✅ Mettre à jour tous vos scripts automatiquement
- ✅ Sauvegarder vos anciens fichiers
- ✅ Configurer la sécurité Git

### 2. Configuration du Nouveau Système

Après la migration, éditez `.env` :

```bash
# Éditer la configuration centralisée
nano .env

# Structure du fichier:
SHOPIFY_STORE_DOMAIN="f6d72e-0f.myshopify.com"
SHOPIFY_ADMIN_TOKEN="VOTRE_NOUVEAU_TOKEN_ICI"
SHOPIFY_CLI_THEME_TOKEN="VOTRE_NOUVEAU_CLI_TOKEN_ICI"
# + tous vos autres tokens organisés
```

### 3. Gestion Quotidienne

```bash
# Tester tous les tokens
./manage-tokens.sh test-all

# Import sécurisé des couleurs
./manage-tokens.sh import-colors

# Afficher la configuration
./manage-tokens.sh show
```

## 🔧 CRÉATION DE NOUVEAUX TOKENS SHOPIFY

### Admin API Token (Priorité 1)

1. **Shopify Admin** → **Apps and sales channels** → **Develop apps**
2. **Create an app** (si pas encore fait) : "TPS Colors System"
3. **Configuration** → **Admin API access scopes** :
   - ✅ `read_metaobjects`
   - ✅ `write_metaobjects`
   - ✅ `read_products` (si nécessaire)
4. **Install app** → **Reveal token once** → **Copier le token**

### Theme Access Password (Priorité 2)

1. **Shopify Admin** → **Online Store** → **Themes**
2. **Actions** → **Edit code**
3. En bas de page : **Create a private app** ou **Theme Access**
4. **Generate password** → **Copier le password**

## 📋 PROCESSUS DE MIGRATION STEP-BY-STEP

### Étape 1: Préparation (5 min)

```bash
# Cloner et préparer
cd ~/Shopify/TPS-BASE-316
./migrate-tokens.sh
```

### Étape 2: Nouveaux Tokens (10 min)

1. **Créer nouveau Admin API token** (voir section ci-dessus)
2. **Créer nouveau Theme Access password**
3. **Noter les tokens temporairement** (vous les saisirez dans .env)

### Étape 3: Configuration (2 min)

```bash
# Éditer la configuration
nano .env

# Remplacer ces lignes :
SHOPIFY_ADMIN_TOKEN="CURRENT_TOKEN_HERE"        # ← Votre nouveau token
SHOPIFY_CLI_THEME_TOKEN="CURRENT_TOKEN_HERE"    # ← Votre nouveau password
```

### Étape 4: Tests (3 min)

```bash
# Tester la nouvelle configuration
./manage-tokens.sh test-all

# Si OK, tester l'import des couleurs
./manage-tokens.sh import-colors
```

### Étape 5: Nettoyage (5 min)

1. **Révoquer TOUS les anciens tokens** dans Shopify Admin
2. **Supprimer les tokens** de vos notes/fichiers
3. **Valider que tout fonctionne** avec les nouveaux tokens

## 🔒 SÉCURITÉ RENFORCÉE

### Fichiers Protégés

- ✅ `.env` - Configuration centrale (non commité)
- ✅ `.env.master` - Template sécurisé (non commité)
- ✅ `manage-tokens.sh` - Gestionnaire (non commité)
- ✅ `*.backup` - Sauvegardes automatiques

### Git Protection

```bash
# Vérifier que les fichiers sensibles sont ignorés
cat .gitignore | grep -E "(\.env|\.backup|manage-tokens)"

# Résultat attendu:
# .env
# .env.local
# .env.master
# *.backup
# manage-tokens.sh
```

## 🎯 AVANTAGES DU NOUVEAU SYSTÈME

### ✅ Centralisé
- **Un seul fichier** `.env` pour tous les tokens
- **Organisation claire** par catégorie (Shopify, Google, etc.)
- **Documentation intégrée** avec dates et usages

### ✅ Sécurisé
- **Variables d'environnement** au lieu de tokens hardcodés
- **Protection Git** automatique
- **Rotation facile** des tokens

### ✅ Maintenable
- **Scripts automatiques** pour tests et usage
- **Sauvegardes automatiques** lors des modifications
- **Centralisation** de la gestion

### ✅ Professionnel
- **Standards de l'industrie** respectés
- **Audit trail** avec dates de création
- **Processus documenté** pour l'équipe

## 🚀 UTILISATION QUOTIDIENNE

```bash
# Test rapide de tous les services
./manage-tokens.sh test-all

# Import des couleurs CSS
./manage-tokens.sh import-colors

# Développement de theme
source .env && shopify theme dev --store $SHOPIFY_STORE_DOMAIN

# Déploiement de theme
source .env && shopify theme push --store $SHOPIFY_STORE_DOMAIN
```

## 🆘 DÉPANNAGE

### Problème: "Token invalide"
```bash
# Vérifier la configuration
./manage-tokens.sh show

# Tester individuellement
./manage-tokens.sh test-admin
./manage-tokens.sh test-theme
```

### Problème: "Fichier .env non trouvé"
```bash
# Recréer depuis le template
cp .env.master .env
nano .env  # Ajouter vos vrais tokens
```

### Problème: "Permission denied"
```bash
# Vérifier les permissions Shopify App
# Admin → Apps → [Votre App] → Configuration
# Scopes requis: read_metaobjects, write_metaobjects
```

---

**🎯 Résultat:** Système de tokens professionnel, sécurisé et maintenable remplaçant 13+ tokens dispersés par une gestion centralisée.
