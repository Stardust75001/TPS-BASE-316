#!/bin/bash

# Script pour renseigner les valeurs hexadécimales des couleurs Pantone dans Shopify
# Usage: Ce fichier contient toutes les informations nécessaires pour remplir manuellement
# les champs "Hex" des metaobjects "Pantone Color" dans l'admin Shopify

echo "🎨 GUIDE POUR RENSEIGNER LES COULEURS PANTONE DANS SHOPIFY"
echo "========================================================="
echo ""
echo "📋 ÉTAPES À SUIVRE :"
echo ""
echo "1. Connectez-vous à votre admin Shopify"
echo "2. Allez dans Contenu > Metaobjects"
echo "3. Sélectionnez 'Pantone Color'"
echo "4. Pour chaque entrée, renseignez le champ 'Hex' avec la valeur correspondante ci-dessous"
echo ""
echo "📊 COULEURS PRINCIPALES À RENSEIGNER EN PRIORITÉ :"
echo ""

# Couleurs les plus utilisées
echo "pantone-process-black-c     → #000000"
echo "pantone-cool-gray-1-c       → #E5E1E6"
echo "pantone-cool-gray-7-c       → #7F7B82"
echo "pantone-186-c               → #CE2939"
echo "pantone-200-c               → #8B0000"
echo "pantone-021-c               → #FF6600"
echo "pantone-7406-c              → #FFD700"
echo "pantone-300-c               → #006BA6"
echo "pantone-286-c               → #0033A0"
echo "pantone-354-c               → #00A651"
echo "pantone-2587-c              → #E6007E"
echo "pantone-468-c               → #F5F5DC"
echo "pantone-469-c               → #8B4513"
echo "pantone-877-c               → #C0C0C0"
echo ""

echo "📄 FICHIER CSV COMPLET DISPONIBLE :"
echo "Utilisez le fichier 'pantone-colors-import.csv' pour toutes les valeurs"
echo ""

echo "🔧 ALTERNATIVE - IMPORT AUTOMATIQUE :"
echo "Si Shopify permet l'import CSV des metaobjects :"
echo "1. Exportez vos metaobjects actuels"
echo "2. Ajoutez la colonne 'Hex' avec les valeurs du CSV"
echo "3. Réimportez le fichier mis à jour"
echo ""

echo "✅ VÉRIFICATION :"
echo "Après avoir renseigné les valeurs, rechargez votre page produit."
echo "Les pastilles de couleur devraient maintenant s'afficher avec les bonnes couleurs !"
echo ""

# Vérification que les fichiers existent
if [ -f "pantone-colors-import.csv" ]; then
    echo "✅ Fichier CSV trouvé : pantone-colors-import.csv"
    echo "   Contient $(wc -l < pantone-colors-import.csv) lignes"
else
    echo "❌ Fichier CSV manquant : pantone-colors-import.csv"
fi

if [ -f "pantone-hex-values.js" ]; then
    echo "✅ Fichier JS trouvé : pantone-hex-values.js"
else
    echo "❌ Fichier JS manquant : pantone-hex-values.js"
fi

echo ""
echo "🎯 RÉSULTAT ATTENDU :"
echo "Après avoir renseigné les valeurs Hex, les pastilles de couleur sur"
echo "https://thepetsociety.paris/products/outdoor-dog-vest-set-4-or-6-pieces"
echo "devraient afficher les vraies couleurs au lieu d'être grises."
