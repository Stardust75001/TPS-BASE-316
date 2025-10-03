#!/bin/bash

echo "🔍 GUIDE DE VÉRIFICATION MANUELLE"
echo "================================="

echo ""
echo "🎯 POUR VÉRIFIER LES COULEURS DANS SHOPIFY ADMIN :"
echo "=================================================="
echo ""
echo "1. Ouvrez votre Admin Shopify :"
echo "   https://f6d72e-0f.myshopify.com/admin"
echo ""
echo "2. Naviguez vers l'une de ces sections :"
echo "   • Settings → Metaobjects"
echo "   • Content → Metaobjects"
echo ""
echo "3. Dans la liste des metaobjects, CLIQUEZ sur 'CSS Colors'"
echo "   (Ne vous arrêtez pas à voir juste l'entrée 'CSS Colors')"
echo ""
echo "4. Cela devrait ouvrir une page montrant TOUTES les couleurs :"
echo "   • Aliceblue (#F0F8FF)"
echo "   • Antiquewhite (#FAEBD7)"
echo "   • Aqua (#00FFFF)"
echo "   • ... et 144 autres couleurs"
echo ""

echo "📊 STATISTIQUES ATTENDUES :"
echo "=========================="

if [[ -f "css-colors-import.csv" ]]; then
    total_lines=$(wc -l < css-colors-import.csv)
    data_lines=$((total_lines - 1))

    echo "✅ Fichier source: css-colors-import.csv"
    echo "📊 Couleurs à importer: $data_lines"
    echo ""
    echo "📋 Exemples de couleurs :"
    echo "========================"
    head -6 css-colors-import.csv | tail -5 | while IFS=',' read -r name hex code; do
        # Nettoyer les guillemets
        name=$(echo "$name" | tr -d '"')
        hex=$(echo "$hex" | tr -d '"')
        echo "   • $name ($hex)"
    done
else
    echo "❌ Fichier CSS non trouvé"
fi

echo ""
echo "🔄 SI VOUS NE VOYEZ QU'UNE SEULE ENTRÉE :"
echo "========================================"
echo ""
echo "• C'est normal ! 'CSS Colors' est le NOM du type de metaobject"
echo "• Il faut CLIQUER DESSUS pour voir toutes les couleurs individuelles"
echo "• C'est comme un dossier qui contient 147 fichiers"
echo ""

echo "🛠️ ACTIONS POSSIBLES :"
echo "====================="
echo ""
echo "1. Vérification manuelle (recommandé) :"
echo "   → Suivre les étapes ci-dessus dans l'Admin"
echo ""
echo "2. Re-import si nécessaire :"
echo "   → node import-node.js"
echo ""
echo "3. Test avec quelques couleurs :"
echo "   → node test-reimport.js"
echo ""

echo "=== GUIDE TERMINÉ ==="
