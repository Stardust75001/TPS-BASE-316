#!/bin/bash

# IMPORT SIMPLE - COULEURS CSS
# Version simplifiée sans dépendances complexes

# Configuration
TOKEN="shpat_REDACTED"
SHOP="f6d72e-0f"
API_VERSION="2025-01"
CSV_FILE="css-colors-import.csv"

echo "🌈 IMPORT SIMPLE - COULEURS CSS"
echo "==============================="
echo "📅 $(date)"
echo ""

# Vérifier que le fichier CSV existe
if [[ ! -f "$CSV_FILE" ]]; then
    echo "❌ Fichier CSV non trouvé: $CSV_FILE"
    exit 1
fi

# Compter le nombre de lignes (sans l'en-tête)
total=$(tail -n +2 "$CSV_FILE" | wc -l | tr -d ' ')
echo "📊 Total à importer: $total couleurs"
echo ""

counter=0
success=0
errors=0

# Lire le CSV ligne par ligne (en sautant l'en-tête)
while IFS=',' read -r name hex code; do
    counter=$((counter + 1))

    # Nettoyer les données (supprimer les guillemets et espaces)
    name=$(echo "$name" | tr -d '"' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    hex=$(echo "$hex" | tr -d '"' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    code=$(echo "$code" | tr -d '"' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

    printf "[%d/%d] %-20s %s ... " "$counter" "$total" "$name" "$hex"

    # Créer le JSON payload
    json_payload=$(cat <<EOF
{
  "metaobject": {
    "type": "colors",
    "fields": {
      "display_name": "$name",
      "hex_value": "$hex",
      "css_name": "$code"
    }
  }
}
EOF
)

    # Faire l'appel API
    response=$(curl -s -w "%{http_code}" \
        -X POST \
        -H "X-Shopify-Access-Token: $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$json_payload" \
        "https://$SHOP.myshopify.com/admin/api/$API_VERSION/metaobjects.json" \
        -o /tmp/color_response.json 2>/dev/null)

    # Extraire le code de statut
    status_code="${response: -3}"

    if [[ "$status_code" == "201" ]]; then
        echo "✅ OK"
        success=$((success + 1))
    elif [[ "$status_code" == "422" ]]; then
        # Vérifier si c'est un duplicata
        if grep -q "already exists\|duplicate" /tmp/color_response.json 2>/dev/null; then
            echo "⚠️  EXISTE DÉJÀ"
            success=$((success + 1))  # Compter comme succès
        else
            echo "❌ VALIDATION"
            errors=$((errors + 1))
            echo "    Error: $(cat /tmp/color_response.json 2>/dev/null || echo 'Erreur inconnue')"
        fi
    elif [[ "$status_code" == "429" ]]; then
        echo "⏳ RATE LIMIT - Pause 30s..."
        sleep 30
        # Réessayer une fois
        response=$(curl -s -w "%{http_code}" \
            -X POST \
            -H "X-Shopify-Access-Token: $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$json_payload" \
            "https://$SHOP.myshopify.com/admin/api/$API_VERSION/metaobjects.json" \
            -o /tmp/color_response.json 2>/dev/null)

        status_code="${response: -3}"
        if [[ "$status_code" == "201" ]]; then
            echo "    ✅ OK (après retry)"
            success=$((success + 1))
        else
            echo "    ❌ ÉCHEC RETRY ($status_code)"
            errors=$((errors + 1))
        fi
    else
        echo "❌ ERREUR HTTP $status_code"
        errors=$((errors + 1))
    fi

    # Petite pause pour éviter le rate limiting
    sleep 1

done < <(tail -n +2 "$CSV_FILE")

# Nettoyage
rm -f /tmp/color_response.json

echo ""
echo "=== RÉSULTAT FINAL ==="
echo "✅ Succès: $success/$total"
echo "❌ Erreurs: $errors/$total"

if [[ $errors -eq 0 ]]; then
    echo ""
    echo "🎉 IMPORT TERMINÉ AVEC SUCCÈS !"
    echo "Toutes les couleurs ont été importées dans Shopify"
else
    echo ""
    echo "⚠️  Import terminé avec $errors erreurs"
fi
