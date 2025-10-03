# ==========================================
# ANALYTICS MULTI-ENVIRONMENTS CONFIG
# ==========================================

## 🏗️ Architecture Recommandée

Avec plusieurs thèmes (dev, live, staging), voici l'organisation optimale :

```
📦 Projet/
├── 📄 .env.development     # IDs de développement
├── 📄 .env.staging         # IDs de pré-production
├── 📄 .env.production      # IDs de production
├── 📄 .env                 # Configuration active (lien symbolique)
└── 📄 multi-env.js         # Gestionnaire d'environnements
```

## 🎯 Configuration par Environnement

### DÉVELOPPEMENT
- GTM: Container de test/sandbox
- GA4: Propriété de développement
- Facebook: Pixel de test
- Debug: Activé

### STAGING/PREVIEW
- GTM: Container de pré-production
- GA4: Propriété de test
- Facebook: Pixel de test
- Debug: Partiel

### PRODUCTION/LIVE
- GTM: Container de production
- GA4: Propriété réelle
- Facebook: Pixel réel
- Debug: Désactivé

## 🚀 Utilisation

```bash
# Lister les environnements
npm run env:list

# Charger l'environnement dev
npm run env:dev

# Charger l'environnement production
npm run env:prod

# Valider toutes les configs
npm run env:validate

# Synchroniser les webmaster tools
npm run env:sync
```

## 💡 Avantages

✅ **Séparation claire** des environnements
✅ **IDs appropriés** par contexte
✅ **Évite la pollution** des données
✅ **Gestion centralisée** mais flexible
✅ **Synchronisation** des outils communs
✅ **Validation** automatique

## 🔄 Workflow Recommandé

1. **Développement**: `npm run env:dev`
2. **Test**: `npm run env:staging`
3. **Production**: `npm run env:prod`
4. **Déploiement**: Configuration automatique via CI/CD
