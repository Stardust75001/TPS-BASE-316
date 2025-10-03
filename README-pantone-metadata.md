# Script de Remplissage des Métadonnées Pantone

Ce script remplit automatiquement les champs `Name` et `Hex` vides dans les métaobjects Pantone Color de votre boutique Shopify.

## 🎯 Fonctionnalités

- ✅ **Remplissage automatique** des champs Name et Hex
- ✅ **330+ couleurs Pantone** supportées
- ✅ **Sécurité** - ne modifie que les champs vides
- ✅ **Mode prévisualisation** avant modification
- ✅ **Gestion d'erreurs** robuste

## 📋 Prérequis

1. **Token d'API Shopify** avec permissions :
   - `read_metaobjects`
   - `write_metaobjects`

2. **Node.js** installé sur votre système

## 🚀 Installation

1. **Copiez le fichier de configuration** :

   ```bash
   cp .env.example.pantone .env
   ```

2. **Remplissez vos identifiants Shopify** dans `.env` :

   ```bash
   SHOPIFY_SHOP_DOMAIN=votre-boutique-sans-myshopify-com
   SHOPIFY_ACCESS_TOKEN=shpat_votre_token_ici
   ```

3. **Installez les dépendances** si nécessaire :

   ```bash
   npm install dotenv
   ```

## 📊 Utilisation

### Mode Prévisualisation (recommandé)

```bash
node fill-pantone-metadata.cjs
```

Affiche un aperçu des modifications sans les appliquer.

### Mode Exécution

```bash
FORCE=1 node fill-pantone-metadata.cjs
```

Applique réellement les modifications.

## 📈 Exemple de sortie

```text
🚀 Démarrage du script de remplissage des métadonnées Pantone
📋 Récupération des métaobjects Pantone Color...
✅ Trouvé 245 métaobjects
🔍 Analyse des métaobjects...
📝 127 métaobjects nécessitent une mise à jour

📋 Aperçu des mises à jour:
  • red:
    - Name: "Rouge"
    - Hex: "#FF0000"
  • pantone-186-c:
    - Name: "Red 186"
    - Hex: "#CE2939"
  • blue:
    - Name: "Bleu"
    - Hex: "#0000FF"
  ... et 124 autres

❓ Voulez-vous continuer? (ajoutez FORCE=1 pour forcer)
```

## 🎨 Couleurs supportées

Le script supporte plus de 330 couleurs Pantone incluant :

- **Couleurs de base** : Rouge, Bleu, Vert, Jaune, etc.
- **Séries Pantone** : 100-330 (jaunes, oranges, rouges, bleus, verts)
- **Gris Pantone** : Cool Gray et Warm Gray 1-11
- **Couleurs spécialisées** : Process Black, Process Blue, etc.

## 🔧 Codes de couleurs mappés

Exemples de mappings automatiques :

| Code Shopify | Nom généré | Hex |
|-------------|------------|-----|
| `red` | Rouge | #FF0000 |
| `pantone-186-c` | Red 186 | #CE2939 |
| `pantone-process-black-c` | Process Black | #000000 |
| `pantone-300-c` | Blue 300 | #006BA6 |

## ⚠️ Notes importantes

- ✅ Le script **ne modifie que les champs vides**
- ✅ Les champs déjà remplis sont **préservés**
- ✅ Mode prévisualisation pour **validation avant application**
- ⚠️ Nécessite des **permissions d'écriture** sur les métaobjects

## 🆘 Dépannage

### "Variables d'environnement manquantes"

Vérifiez que `.env` contient `SHOPIFY_SHOP_DOMAIN` et `SHOPIFY_ACCESS_TOKEN`.

### "Aucun métaobject trouvé"

Vérifiez que vos métaobjects utilisent le type `pantone_color`.

### "Erreur d'autorisation"

Vérifiez les permissions de votre token d'API Shopify.

## 🏃‍♂️ Exécution rapide

Pour une exécution directe avec confirmation automatique :

```bash
FORCE=1 node fill-pantone-metadata.cjs
```
