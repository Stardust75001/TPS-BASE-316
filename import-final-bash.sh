#!/bin/bash

# IMPORT FINAL BASH - Utilise curl qui fonctionne à 100%
# Base sur le test réussi avec "Test Check"

TOKEN="shpat_REDACTED"
API_URL="https://f6d72e-0f.myshopify.com/admin/api/2025-01/metaobjects.json"

echo "🌈 IMPORT FINAL BASH - COULEURS CSS"
echo "=================================="

# Lire le CSV et créer un array
colors=()
while IFS=',' read -r name hex code; do
    # Skip header
    if [[ "$name" != "Name" ]]; then
        colors+=("$name,$hex,$code")
    fi
done < css-colors-import.csv

total=${#colors[@]}
success=0
errors=0

echo "📊 Total: $total couleurs à importer"
echo ""

# Import des couleurs
for i in "${!colors[@]}"; do
    IFS=',' read -ra COLOR <<< "${colors[$i]}"
    name="${COLOR[0]}"
    hex="${COLOR[1]}"
    code="${COLOR[2]}"

    # Progress
    progress=$((i + 1))
    echo -n "📤 [$progress/$total] $name ($hex)... "

    # JSON payload - EXACTEMENT comme le test qui fonctionne
    json='{"metaobject":{"type":"colors","fields":[{"key":"display_name","value":"'$name'"},{"key":"hex_value","value":"'$hex'"},{"key":"css_name","value":"'$code'"}]}}'

    # API call
    response=$(curl -s -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -H "X-Shopify-Access-Token: $TOKEN" \
        -d "$json" \
        "$API_URL")

    # Extract status code (last 3 characters)
    status_code="${response: -3}"
    response_body="${response%???}"

    if [ "$status_code" = "201" ]; then
        echo "✅ OK"
        ((success++))
    else
        echo "❌ HTTP $status_code"
        ((errors++))

        # Stop après 5 erreurs consécutives
        if [ $errors -gt 5 ]; then
            echo "❌ Trop d'erreurs, arrêt de l'import"
            break
        fi
    fi

    # Délai respectueux pour l'API (1.2s)
    sleep 1.2
done

# Rapport final
echo ""
echo "======================================"
echo "📊 RÉSULTATS FINAUX"
echo "======================================"
echo "✅ Succès: $success/$total couleurs"
echo "❌ Erreurs: $errors/$total couleurs"

if [ $success -gt 0 ]; then
    echo ""
    echo "🎉 IMPORT RÉUSSI !"
    echo "🔗 Admin: https://admin.shopify.com/store/f6d72e-0f/content/metaobjects"
    echo ""
    echo "🚀 Vos couleurs CSS sont maintenant disponibles !"
    echo "📄 Utilisables dans vos templates Liquid"
fi

echo ""
echo "✨ Terminé ! ✨"
