#!/bin/bash

# Script d'exécution rapide pour les commandes Pantone ChatGPT
# Basé sur les exemples donnés dans les screenshots

echo "🎨 PANTONE SHOPIFY UPDATER - COMMANDES CHATGPT"
echo "=============================================="
echo ""

# Vérifier que les fichiers existent
if [ ! -f "pantone-fill-hex.cjs" ]; then
    echo "❌ Fichier pantone-fill-hex.cjs manquant"
    exit 1
fi

if [ ! -f "pantone-colors-import.csv" ] && [ ! -f "~/notion-views-setup/pantone-hex.csv" ]; then
    echo "❌ Fichier CSV Pantone manquant"
    exit 1
fi

echo "📋 Variables d'environnement nécessaires:"
echo "# Already used by other scripts"
echo "SHOPIFY_SHOP=xxx.myshopify.com"
echo "SHOPIFY_ADMIN_TOKEN=shpat_xxx"
echo ""

echo "🚀 Commandes disponibles (comme suggérées par ChatGPT):"
echo ""

# Commande 1: Preview
echo "1️⃣  PREVIEW (recommandé en premier):"
echo "node pantone-fill-hex.cjs ~/notion-views-setup/pantone-hex.csv --dry"
echo "   ↳ Voir ce qui sera modifié sans faire de changements"
echo ""

# Commande 2: Write
echo "2️⃣  WRITE (exécution réelle):"
echo "node pantone-fill-hex.cjs ~/notion-views-setup/pantone-hex.csv"
echo "   ↳ Remplir tous les champs hex manquants"
echo ""

# Commande 3: Force
echo "3️⃣  FORCE (réécriture complète):"
echo "node pantone-fill-hex.cjs ~/notion-views-setup/pantone-hex.csv --force"
echo "   ↳ Remplacer même les valeurs existantes"
echo ""

# Choix interactif
echo "Quelle commande voulez-vous exécuter ?"
echo "1) Preview (--dry)"
echo "2) Write (normal)"
echo "3) Force (--force)"
echo "q) Quitter"
echo ""

read -p "Votre choix [1-3/q]: " choice

case $choice in
    1)
        echo "🔍 Exécution du preview..."
        node pantone-fill-hex.cjs ~/notion-views-setup/pantone-hex.csv --dry
        ;;
    2)
        echo "✍️  Exécution normale..."
        node pantone-fill-hex.cjs ~/notion-views-setup/pantone-hex.csv
        ;;
    3)
        echo "💪 Exécution forcée..."
        node pantone-fill-hex.cjs ~/notion-views-setup/pantone-hex.csv --force
        ;;
    q|Q)
        echo "👋 Bye!"
        exit 0
        ;;
    *)
        echo "❌ Choix invalide"
        exit 1
        ;;
esac

echo ""
echo "✅ Commande terminée!"
echo "🎯 Vérifiez maintenant vos pastilles de couleur sur:"
echo "   https://thepetsociety.paris/products/outdoor-dog-vest-set-4-or-6-pieces"
