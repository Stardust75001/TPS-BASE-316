#!/bin/bash

echo "📋 GUIDE IMPORT CSV COMPLET VERS SHOPIFY"
echo "========================================"

echo ""
echo "🎯 MÉTHODE 1: SCRIPT AUTOMATIQUE"
echo "================================"
echo "Commande: node import-all-colors.js"
echo "→ Tente d'importer les 147 couleurs automatiquement"
echo ""

echo "🎯 MÉTHODE 2: INTERFACE SHOPIFY ADMIN"
echo "====================================="
echo "1. 🌐 Admin Shopify: https://admin.shopify.com/store/f6d72e-0f/settings/custom_data"
echo "2. 📁 Cliquez sur 'CSS Colors'"
echo "3. 🔍 Cherchez bouton 'Import', 'Actions' ou '⋯'"
echo "4. 📤 Uploadez: css-colors-import.csv"
echo "5. 🔗 Mappez: Name→display_name, Hex→hex_value, Code→css_name"
echo ""

echo "🎯 MÉTHODE 3: APPS SHOPIFY"
echo "=========================="
echo "Si les méthodes 1&2 échouent, installez:"
echo "• Matrixify (ex Excelify) - Import/Export"
echo "• Ablestar Bulk Product Editor"
echo "• Easy Bulk Price Editor"
echo ""

echo "🎯 MÉTHODE 4: SHOPIFY PLUS FLOW"
echo "==============================="
echo "Si vous avez Shopify Plus:"
echo "• Utilisez Shopify Flow"
echo "• Ou Launchpad pour import massif"
echo ""

# Vérifier le fichier CSV
echo "📊 ANALYSE DU FICHIER CSV"
echo "========================="
if [ -f "css-colors-import.csv" ]; then
    echo "✅ Fichier trouvé: css-colors-import.csv"
    echo "📈 Lignes totales: $(wc -l < css-colors-import.csv)"
    echo "🌈 Couleurs à importer: $(($(wc -l < css-colors-import.csv) - 1))"
    echo ""
    echo "📋 Aperçu des premières couleurs:"
    echo "--------------------------------"
    head -6 css-colors-import.csv | tail -5 | while IFS=',' read -r name hex code; do
        echo "  $name → $hex ($code)"
    done
else
    echo "❌ Fichier css-colors-import.csv non trouvé"
fi

echo ""
echo "🚀 COMMANDES RAPIDES"
echo "===================="
echo "# Import automatique complet:"
echo "node import-all-colors.js"
echo ""
echo "# Vérification après import:"
echo "node validate-color-system.js"
echo ""
echo "# Test du système:"
echo "shopify theme push --only=snippets/color-system-test.liquid"
echo ""

echo "💡 TIP: Commencez par la Méthode 2 (interface Shopify) - c'est le plus fiable !"
