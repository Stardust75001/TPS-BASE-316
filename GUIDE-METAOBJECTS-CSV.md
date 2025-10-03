# 🎨 Guide d'utilisation - fill-pantone-metaobjects.cjs

## ✅ Script créé avec succès

Le script `fill-pantone-metaobjects.cjs` permet de créer et mettre à jour les métaobjects Pantone dans Shopify depuis un fichier CSV.

## 📋 Format CSV requis

Votre fichier CSV doit avoir les colonnes suivantes :

```csv
code,name,hex
PANTONE 186 C,Red,#E2231A
PANTONE 354 C,Green,#00A651
PANTONE 300 C,Blue,#005EB8
```

**Colonnes acceptées** (flexibles) :

- `code` / `Code` → Code Pantone (ex: "PANTONE 186 C")
- `name` / `Name` → Nom de la couleur (ex: "Red")
- `hex` / `Hex` / `HEX` → Code couleur hexadécimal (ex: "#E2231A")

## 🚀 Utilisation

### 1. Test avec aperçu (recommandé)

```bash
cd /Users/asc/Shopify/tps-base
node fill-pantone-metaobjects.cjs --csv pantone-hex.csv --dry
```

### 2. Création/mise à jour réelle

```bash
cd /Users/asc/Shopify/tps-base
node fill-pantone-metaobjects.cjs --csv pantone-hex.csv
```

### 3. Via le lanceur intégré

```bash
cd /Users/asc/Shopify/tps-base
./pantone-launcher.sh metaobjects --csv pantone-hex-extended.csv --dry
```

## 📁 Fichiers CSV disponibles

1. **pantone-hex.csv** - Fichier de base (5 couleurs)
2. **pantone-hex-extended.csv** - Fichier étendu (15 couleurs)
3. Vous pouvez créer vos propres fichiers CSV

## 🔧 Fonctionnalités

- ✅ **Détection intelligente** : Évite les doublons, compare les champs
- ✅ **Gestion des handles** : Conversion automatique "PANTONE 186 C" → "pantone-color-186-c"
- ✅ **Mode dry run** : Testez sans modifier Shopify
- ✅ **Pagination** : Gère automatiquement les grandes collections
- ✅ **Throttling** : Respecte les limites API Shopify
- ✅ **Logs détaillés** : Suivi complet des opérations

## 🎯 Compatibilité avec votre thème

Le script crée des métaobjects avec les champs suivants :

- **Type** : `pantone_color`
- **Champs** :
  - `pantone_color_code` → Code Pantone
  - `pantone_color_name` → Nom de la couleur
  - `pantone_color_hex` → Code hexadécimal

Ces champs sont compatibles avec votre système de détection de couleurs dans `assets/product.js`.

## ⚠️ Configuration requise

Variables d'environnement nécessaires dans votre `.env` :

```bash
SHOPIFY_SHOP=votre-boutique.myshopify.com
SHOPIFY_ADMIN_TOKEN=shpat_xxxxx
SHOPIFY_API_VERSION=2024-07  # optionnel
```

## 📊 Exemple de sortie

```text
Lu 15 lignes depuis pantone-hex-extended.csv
Récupération des metaobjects pantone_color existants…
104 entrées existantes chargées.

Create pantone-color-186-c  (PANTONE 186 C | Red | #E2231A)
Create pantone-color-354-c  (PANTONE 354 C | Green | #00A651)
...

Terminé. Créés: 15, Mis à jour: 0, Inchangés: 0. (dry run)
```

## 🔄 Workflow recommandé

1. **Créer votre CSV** avec vos couleurs Pantone
2. **Tester** avec `--dry` pour vérifier
3. **Exécuter** sans `--dry` pour créer les métaobjects
4. **Vérifier** dans l'admin Shopify : Contenu → Métaobjects → pantone_color
5. **Utiliser** les couleurs dans vos produits via les métachamps

---

🎨 **Votre système Pantone est maintenant prêt à fonctionner avec vos métaobjects Shopify !**
