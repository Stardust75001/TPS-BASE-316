#!/bin/bash

# 🎯 Scripts Pantone disponibles dans TPS-BASE
# Utilisez ce guide pour savoir quel script exécuter

echo "📋 Scripts Pantone disponibles :"
echo ""

# Vérifier quel script vous voulez exécuter
if [ "$1" = "help" ] || [ "$1" = "--help" ] || [ -z "$1" ]; then
    echo "1️⃣  fill-pantone-metadata.cjs"
    echo "   👉 Remplit automatiquement les champs Name et Hex des métaobjects Pantone"
    echo "   📖 Usage: node fill-pantone-metadata.cjs"
    echo ""

    echo "2️⃣  pantone-fill-hex.cjs"
    echo "   👉 Script automatique pour remplir les champs hex (version ChatGPT)"
    echo "   📖 Usage: node pantone-fill-hex.cjs [--force] [--dry]"
    echo ""

    echo "3️⃣  hybrid-pantone-manager.cjs"
    echo "   👉 Gestionnaire hybride avec 5 modes d'opération"
    echo "   📖 Usage: node hybrid-pantone-manager.cjs <mode>"
    echo "   📖 Modes: preview | csv-export | csv-import | api-direct | hybrid"
    echo ""

    echo "4️⃣  fill-pantone-metaobjects.cjs"
    echo "   👉 Crée/met à jour les metaobjects depuis un CSV (code,name,hex)"
    echo "   📖 Usage: node fill-pantone-metaobjects.cjs --csv pantone-hex.csv [--dry]"
    echo ""

    echo "📁 Fichiers CSV disponibles :"
    ls -la *.csv 2>/dev/null | grep -E "(pantone|notion)" | awk '{print "   📄 " $9}'
    echo ""

    echo "🚀 Exemples d'utilisation :"
    echo "   node fill-pantone-metadata.cjs                         # Remplir métadonnées directement"
    echo "   node hybrid-pantone-manager.cjs preview               # Prévisualiser les changements"
    echo "   node hybrid-pantone-manager.cjs api-direct            # Mise à jour directe API"
    echo "   node pantone-fill-hex.cjs --dry                       # Test sans modification"
    echo "   node fill-pantone-metaobjects.cjs --csv pantone-hex.csv --dry  # Test CSV"

    exit 0
fi

# Exécuter le script demandé
case "$1" in
    "metadata")
        echo "🎯 Exécution de fill-pantone-metadata.cjs..."
        node fill-pantone-metadata.cjs "${@:2}"
        ;;
    "hex")
        echo "🎯 Exécution de pantone-fill-hex.cjs..."
        node pantone-fill-hex.cjs "${@:2}"
        ;;
    "hybrid")
        echo "🎯 Exécution de hybrid-pantone-manager.cjs..."
        if [ -z "$2" ]; then
            echo "❌ Mode requis pour hybrid-pantone-manager.cjs"
            echo "📖 Modes disponibles: preview | csv-export | csv-import | api-direct | hybrid"
            exit 1
        fi
        node hybrid-pantone-manager.cjs "${@:2}"
        ;;
    "metaobjects")
        echo "🎯 Exécution de fill-pantone-metaobjects.cjs..."
        node fill-pantone-metaobjects.cjs "${@:2}"
        ;;
    *)
        echo "❌ Script non reconnu: $1"
        echo "📖 Utilisez './pantone-launcher.sh help' pour voir l'aide"
        exit 1
        ;;
esac
