#!/bin/bash

# =============================================================================
# SCRIPT DE VALIDATION DU SYSTÈME COULEURS CSS
# =============================================================================
# Vérifie que tous les composants sont en place et fonctionnels

echo "🔍 VALIDATION DU SYSTÈME COULEURS CSS"
echo "====================================="
echo ""

# Compteurs
checks_passed=0
checks_total=0

function check_file() {
    local file="$1"
    local description="$2"

    checks_total=$((checks_total + 1))

    if [ -f "$file" ]; then
        echo "✅ $description: $file"
        checks_passed=$((checks_passed + 1))
        return 0
    else
        echo "❌ $description: $file (MANQUANT)"
        return 1
    fi
}

function check_csv_content() {
    local file="$1"

    checks_total=$((checks_total + 1))

    if [ -f "$file" ]; then
        local line_count=$(wc -l < "$file")
        if [ "$line_count" -gt 140 ]; then
            echo "✅ CSV Couleurs: $line_count lignes (147 couleurs attendues)"
            checks_passed=$((checks_passed + 1))
        else
            echo "⚠️  CSV Couleurs: seulement $line_count lignes"
        fi
    fi
}

function check_node_modules() {
    checks_total=$((checks_total + 1))

    if npm list csv-parse &> /dev/null; then
        echo "✅ Dépendance Node.js: csv-parse installée"
        checks_passed=$((checks_passed + 1))
    else
        echo "⚠️  Dépendance Node.js: csv-parse manquante"
        echo "   Exécutez: npm install csv-parse"
    fi
}

# Vérifications des fichiers
echo "📁 Vérification des fichiers..."
check_file "css-colors-import.csv" "Fichier CSV couleurs"
check_file "setup-colors-metaobject.js" "Script configuration"
check_file "css-colors-to-shopify.js" "Script import principal"
check_file "deploy-colors-system.sh" "Script déploiement"
check_file "snippets/product-color-variants.liquid" "Template Liquid"
check_file "README-COLORS-SYSTEM.md" "Guide d'utilisation"

# Vérification du contenu CSV
echo ""
echo "📊 Vérification du contenu..."
check_csv_content "css-colors-import.csv"

# Vérification des dépendances
echo ""
echo "🔧 Vérification des dépendances..."
check_node_modules

# Test de syntaxe JavaScript
echo ""
echo "🧪 Test de syntaxe JavaScript..."
checks_total=$((checks_total + 2))

if node -c setup-colors-metaobject.js 2>/dev/null; then
    echo "✅ Syntaxe JS: setup-colors-metaobject.js"
    checks_passed=$((checks_passed + 1))
else
    echo "❌ Syntaxe JS: setup-colors-metaobject.js (ERREUR)"
fi

if node -c css-colors-to-shopify.js 2>/dev/null; then
    echo "✅ Syntaxe JS: css-colors-to-shopify.js"
    checks_passed=$((checks_passed + 1))
else
    echo "❌ Syntaxe JS: css-colors-to-shopify.js (ERREUR)"
fi

# Vérification Shopify CLI
echo ""
echo "🛍️  Vérification Shopify..."
checks_total=$((checks_total + 1))

if command -v shopify &> /dev/null; then
    echo "✅ Shopify CLI: $(shopify version)"
    checks_passed=$((checks_passed + 1))

    # Test de connexion
    if shopify whoami &> /dev/null; then
        echo "✅ Connexion Shopify: Active"
    else
        echo "⚠️  Connexion Shopify: Non connecté"
        echo "   Exécutez: shopify auth login"
    fi
else
    echo "❌ Shopify CLI: Non installé"
fi

# Génération d'un échantillon de couleurs pour test
echo ""
echo "🎨 Génération d'un échantillon de test..."

cat > test-colors-sample.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Test Couleurs CSS - Shopify</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .color-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
        .color-item {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 10px;
            text-align: center;
        }
        .color-swatch {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            margin: 0 auto 10px;
            border: 2px solid #ccc;
        }
    </style>
</head>
<body>
    <h1>🌈 Aperçu des Couleurs CSS</h1>
    <div class="color-grid">
EOF

# Ajouter quelques couleurs d'exemple
if [ -f "css-colors-import.csv" ]; then
    head -10 css-colors-import.csv | tail -9 | while IFS=',' read -r name hex code; do
        cat >> test-colors-sample.html << EOF
        <div class="color-item">
            <div class="color-swatch" style="background-color: $hex;"></div>
            <strong>$name</strong><br>
            <small>$hex</small><br>
            <code>$code</code>
        </div>
EOF
    done
fi

cat >> test-colors-sample.html << 'EOF'
    </div>
    <p><strong>Note:</strong> Ceci est un aperçu des couleurs. Le système complet inclut 147 couleurs CSS.</p>
</body>
</html>
EOF

echo "✅ Fichier de test créé: test-colors-sample.html"

# Rapport final
echo ""
echo "📊 RAPPORT DE VALIDATION"
echo "========================"
echo "✅ Tests réussis: $checks_passed/$checks_total"

if [ $checks_passed -eq $checks_total ]; then
    echo "🎉 VALIDATION COMPLÈTE: Tous les tests sont passés!"
    echo ""
    echo "📋 ÉTAPES SUIVANTES:"
    echo "1. Créer le metaobject 'colors' dans l'admin Shopify"
    echo "2. Importer le CSV via l'admin ou exécuter les scripts"
    echo "3. Intégrer le snippet dans vos templates produit"
    echo "4. Tester sur votre store"
elif [ $checks_passed -gt $((checks_total * 3 / 4)) ]; then
    echo "✅ VALIDATION MAJORITAIRE: La plupart des composants sont prêts"
    echo "⚠️  Quelques éléments nécessitent votre attention (voir ci-dessus)"
else
    echo "⚠️  VALIDATION PARTIELLE: Plusieurs éléments nécessitent attention"
    echo "❌ Veuillez corriger les problèmes signalés avant de continuer"
fi

# Instructions finales
echo ""
echo "🔗 LIENS UTILES:"
echo "• Admin Shopify Metaobjects: https://admin.shopify.com/settings/custom_data"
echo "• Documentation: https://help.shopify.com/manual/metafields/metaobjects"
echo "• Guide complet: README-COLORS-SYSTEM.md"
echo ""
echo "🎯 Pour tester l'aperçu des couleurs, ouvrez: test-colors-sample.html"
