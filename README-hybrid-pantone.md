# Gestionnaire Hybride de Métadonnées Pantone 🎨

## Vue d'ensemble

Le **Gestionnaire Hybride** combine le meilleur des deux approches :

- ✅ **API directe** (notre méthode originale) pour la rapidité et la simplicité
- ✅ **Workflow CSV** (inspiré de ChatGPT) pour la flexibilité et l'édition manuelle
- ✅ **Mapping Pantone étendu** (400+ couleurs) pour une couverture maximale

## 🚀 Utilisation rapide

### Prévisualisation (recommandé en premier)

```bash
./run-hybrid-pantone.sh preview
```

### Mode Hybride automatique

```bash
./run-hybrid-pantone.sh hybrid
```

### Workflow interactif étape par étape

```bash
./run-hybrid-pantone.sh workflow
```

## 📋 Modes disponibles

| Mode | Description | Cas d'usage |
|------|-------------|-------------|
| `preview` | Analyse sans modification | Vérifier ce qui sera changé |
| `csv-export` | Export vers CSV | Édition manuelle dans Excel |
| `csv-import` | Import depuis CSV | Appliquer les modifications CSV |
| `api-direct` | API Shopify directe | Mise à jour rapide automatique |
| `hybrid` | Combiné auto | Meilleur des deux approches |
| `workflow` | Interactif guidé | Contrôle étape par étape |

## 🎨 Couleurs supportées

### Extension du mapping Pantone (400+ couleurs)

Le système hybride supporte maintenant :

#### Séries Pantone officielles

- **Pantone Coated (C)** : 100-C à 330-C et plus
- **Pantone Uncoated (U)** : versions non couchées
- **Pantone Métalliques** : Or, Argent, Bronze
- **Pantone Fluorescents** : couleurs fluo vives
- **Pantone Pastels** : tons doux et clairs

#### Couleurs de base étendues

- **Anglais** : red, blue, green, yellow, orange, purple, pink, brown, black, white, gray, beige, navy, maroon, teal, olive, lime, aqua, silver, fuchsia
- **Français** : rouge, bleu, vert, jaune, orange, violet, rose, marron, noir, blanc, gris

#### Exemples de nouvelles couleurs

```javascript
"pantone-871-c": "#D4AF37",     // Or Métallique
"pantone-877-c": "#C0C0C0",     // Argent Métallique
"pantone-801-c": "#FF1493",     // Rose Fluo
"pantone-9181-c": "#F0E6FF",    // Lavande Pâle
"navy": "#000080",              // Bleu Marine
"teal": "#008080",              // Sarcelle
```

## 🔄 Workflows recommandés

### Pour une première utilisation

1. **Prévisualisation** : `./run-hybrid-pantone.sh preview`
2. **Mode hybride** : `./run-hybrid-pantone.sh hybrid`

### Pour un contrôle total

1. **Export CSV** : `./run-hybrid-pantone.sh csv-export`
2. **Édition manuelle** dans Excel/Numbers
3. **Import CSV** : `./run-hybrid-pantone.sh csv-import fichier.csv`

### Pour des mises à jour rapides

1. **API directe** : `./run-hybrid-pantone.sh api-direct`

### Pour découvrir le processus

1. **Workflow interactif** : `./run-hybrid-pantone.sh workflow`

## 🛡️ Sécurités intégrées

- ✅ **Préservation des données existantes** (ne modifie que les champs vides)
- ✅ **Confirmations avant application** des changements
- ✅ **Mode prévisualisation** systématique
- ✅ **Sauvegarde CSV** avant modifications importantes
- ✅ **Gestion d'erreurs** robuste avec rollback

## 📊 Formats de sortie

### Console

```text
🚀 Gestionnaire Hybride de Métadonnées Pantone
=========================================================
👁️ Mode Prévisualisation

📊 Analyse: 104 métaobjects, 23 à mettre à jour

📋 Aperçu des mises à jour:
  • black:
    - Name: "Noir"
    - Hex: "#000000"
  • blue:
    - Name: "Bleu"
    - Hex: "#0000FF"
```

### CSV Export

```csv
ID,Code,Name,Hex,Handle,Updated
"gid://shopify/Metaobject/1","black","Noir","#000000","pantone-color-black","false"
"gid://shopify/Metaobject/2","blue","Bleu","#0000FF","pantone-color-blue","false"
```

## 🔧 Configuration

### Variables d'environnement supportées

Le système détecte automatiquement plusieurs formats :

```bash
# Format recommandé
SHOPIFY_SHOP_DOMAIN=ma-boutique
SHOPIFY_ACCESS_TOKEN=shpat_...

# Format alternatif (existant)
SHOPIFY_SHOP=ma-boutique.myshopify.com
SHOPIFY_ADMIN_TOKEN=shpat_...

# Format court
SHOP=ma-boutique
ACCESS_TOKEN=shpat_...
```

## 🆚 Comparaison des approches

| Aspect | API Directe | CSV Workflow | Mode Hybride |
|--------|-------------|--------------|--------------|
| **Rapidité** | ⭐⭐⭐ | ⭐ | ⭐⭐ |
| **Contrôle** | ⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Flexibilité** | ⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Sécurité** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Automatisation** | ⭐⭐⭐ | ⭐ | ⭐⭐⭐ |

## 📈 Exemples d'utilisation

### Scénario 1 : Mise à jour rapide de quelques couleurs

```bash
./run-hybrid-pantone.sh preview    # Vérifier
./run-hybrid-pantone.sh api-direct # Appliquer
```

### Scénario 2 : Gestion de masse avec contrôle

```bash
./run-hybrid-pantone.sh csv-export export.csv  # Export
# Édition manuelle du CSV
./run-hybrid-pantone.sh csv-import export.csv  # Import
```

### Scénario 3 : Processus complet automatisé

```bash
./run-hybrid-pantone.sh hybrid  # Tout en un
```

### Scénario 4 : Découverte et apprentissage

```bash
./run-hybrid-pantone.sh workflow  # Guide interactif
```

## 🏆 Avantages du système hybride

1. **Flexibilité maximale** : choisissez l'approche selon vos besoins
2. **Sécurité renforcée** : multiples niveaux de confirmation
3. **Mapping étendu** : 400+ couleurs Pantone supportées
4. **Workflow adaptatif** : de l'automatique au contrôle total
5. **Compatibilité** : fonctionne avec vos variables d'environnement existantes

## 🆘 Dépannage

### "Script introuvable"

Vérifiez que `hybrid-pantone-manager.cjs` est présent dans le même dossier.

### "Variables d'environnement manquantes"

Le script affiche automatiquement quelles variables sont définies/manquantes.

### "Erreur CSV"

Vérifiez que le fichier CSV a le bon format (ID,Code,Name,Hex,Handle,Updated).

### "Erreur API"

Vérifiez vos permissions Shopify (read_metaobjects, write_metaobjects).

## 🎯 Prochaines étapes

Une fois vos métadonnées mises à jour avec le système hybride, vous pourrez :

1. Tester les pastilles de couleur sur vos pages produits
2. Vérifier la synchronisation avec la galerie
3. Valider l'affichage des noms français
4. Optimiser le mapping selon vos besoins spécifiques
