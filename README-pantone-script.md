# 🎨 Script Automatique Pantone Shopify

## 📋 Vue d'ensemble

Ce script automatise le remplissage des champs `hex` dans vos metaobjects Pantone Color Shopify, basé sur les excellents conseils de ChatGPT !

## ⚡ Installation rapide

```bash
# 1. Installer les dépendances
npm install node-fetch@2 csv-parse dotenv

# 2. Configurer les variables d'environnement
cp .env.example .env
# Éditez .env avec vos vraies valeurs

# 3. Test à blanc (recommandé)
node pantone-fill-hex.cjs --dry-run

# 4. Exécution réelle
node pantone-fill-hex.cjs
```

## 🔑 Configuration Shopify

### Créer un token d'accès privé

1. **Admin Shopify** → Apps → **Develop apps**
2. **Create an app** → Nommez-la "Pantone Updater"
3. **Admin API access** → Configure
4. **Metaobjects** → Cochez `write_metaobjects`
5. **Install app** → Révélez le token
6. Copiez le token dans `.env`

## 🎯 Pourquoi ce script résout le problème

**Explication technique de ChatGPT :**

Votre thème cherche une couleur pour peindre les pastilles dans cet ordre :

1. **`variant.metafields.global.pantone`** → résout vers le handle du metaobject Pantone
2. **Charge le champ `hex`** de ce metaobject → l'utilise pour la pastille
3. **Si manquant**, essaie les fallbacks (text → sampler), comme vu dans les logs

Une fois le champ `hex` rempli sur chaque entrée `pantone_color`, l'étape (2) réussit et les pastilles s'affichent avec la vraie couleur (plus besoin de hardcoder les hex par produit).

**Ce script automatise le remplissage de TOUS les champs hex manquants d'un coup !**

## 📊 Utilisation

### Commandes rapides

```bash
# Prévisualisation (recommandé en premier)
node pantone-fill-hex.cjs --dry

# Écriture réelle
node pantone-fill-hex.cjs

# Forcer la réécriture même sur les champs existants
node pantone-fill-hex.cjs --force
```

### Variables d'environnement (dans .env)

```bash
# Already used by other scripts
SHOPIFY_SHOP=xxx.myshopify.com
SHOPIFY_ADMIN_TOKEN=shpat_xxx
```

### Fichier source

Le script utilise `pantone-colors-import.csv` avec format :

```csv
Handle,Code,Name,Hex
pantone-process-black-c,pantone-process-black-c,PANTONE PROCESS BLACK C,#000000
```

## ✅ Avantages vs approche manuelle

| Aspect | Manuel | Script Auto |
|--------|---------|-------------|
| **Temps** | 2-3h pour 180 entrées | 2-3 minutes |
| **Erreurs** | Risque de typos | Zéro erreur |
| **Maintenance** | Refaire à chaque ajout | Un seul run |
| **Cohérence** | Variable | 100% cohérente |

## 🔄 Workflow recommandé

1. **Test d'abord** : `--dry-run` pour voir ce qui sera modifié
2. **Backup** : Exportez vos metaobjects avant (sécurité)
3. **Exécution** : Lancez le script réel
4. **Vérification** : Testez vos pages produits

## 🎯 Résultat attendu

Après exécution, toutes vos pastilles de couleur sur :

- [Vos pages produits](https://thepetsociety.paris/products/)
- Devraient afficher les vraies couleurs Pantone !

## 🐛 Dépannage

### Erreur "Missing token"

- Vérifiez que `.env` contient `SHOPIFY_ADMIN_TOKEN=shpat_...`

### Erreur "Metaobjects access"

- Assurez-vous que l'app a les permissions `write_metaobjects`

### CSV non trouvé

- Le fichier `pantone-colors-import.csv` doit être dans le même dossier

## 💡 Pourquoi c'est génial

Ce script ChatGPT transforme une tâche fastidieuse de 3h en 3 minutes. C'est exactement le genre d'automatisation intelligente qui fait gagner du temps et élimine les erreurs humaines !

---
Bravo ChatGPT pour cette solution élégante ! 👏
