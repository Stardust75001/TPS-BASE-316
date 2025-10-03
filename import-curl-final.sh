#!/bin/bash

# IMPORT VIA CURL - LA SEULE MÉTHODE QUI FONCTIONNE
# Utilise curl directement puisque tous les tests Node.js échouent

set -e

TOKEN="shpat_REDACTED"
SHOP="f6d72e-0f"
API_VERSION="2025-01"
BASE_URL="https://${SHOP}.myshopify.com/admin/api/${API_VERSION}"

echo "🚀 IMPORT CURL - MÉTHODE QUI FONCTIONNE"
echo "======================================"

# Vérifier que le CSV existe
if [[ ! -f "css-colors-import.csv" ]]; then
    echo "❌ Fichier css-colors-import.csv introuvable"
    exit 1
fi

# Compter les lignes (moins l'en-tête)
total_lines=$(tail -n +2 css-colors-import.csv | wc -l | tr -d ' ')
echo "📊 $total_lines couleurs à importer"

# Fonction pour créer un metaobject
create_color() {
    local name="$1"
    local hex="$2"
    local code="$3"

    # Échapper les guillemets dans le nom
    name=$(echo "$name" | sed 's/"/\\"/g')

    # JSON payload
    json="{\"metaobject\":{\"type\":\"colors\",\"fields\":[{\"key\":\"display_name\",\"value\":\"$name\"},{\"key\":\"hex_value\",\"value\":\"$hex\"},{\"key\":\"css_name\",\"value\":\"$code\"}]}}"

    # Appel curl avec gestion d'erreur
    response=$(curl -s -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -H "X-Shopify-Access-Token: $TOKEN" \
        -d "$json" \
        "$BASE_URL/metaobjects.json")

    # Extraire le code de statut
    status_code="${response: -3}"
    response_body="${response%???}"

    echo "$status_code"
}

# Variables pour les statistiques
success=0
errors=0
counter=0

echo ""
echo "🚀 Début de l'import..."
echo ""

# Lire le CSV ligne par ligne (ignorer l'en-tête)
tail -n +2 css-colors-import.csv | while IFS=',' read -r name hex code; do
    # Supprimer les espaces
    name=$(echo "$name" | xargs)
    hex=$(echo "$hex" | xargs)
    code=$(echo "$code" | xargs)

    # Ignorer les lignes vides
    if [[ -z "$name" || -z "$hex" || -z "$code" ]]; then
        continue
    fi

    ((counter++))

    printf "📤 [%d/%d] %s (%s)... " "$counter" "$total_lines" "$name" "$hex"

    # Créer la couleur
    status=$(create_color "$name" "$hex" "$code")

    if [[ "$status" == "201" ]]; then
        echo "✅ OK"
        ((success++))
    else
        echo "❌ HTTP $status"
        ((errors++))

        # Arrêter après 10 erreurs consécutives
        if [[ $errors -gt 10 ]] && [[ $success -eq 0 ]]; then
            echo ""
            echo "❌ Trop d'erreurs consécutives, arrêt"
            break
        fi
    fi

    # Délai pour respecter les limites API
    sleep 0.8
done

echo ""
echo "================================="
echo "📊 RÉSULTATS FINAUX"
echo "================================="
echo "✅ Succès: $success/$total_lines"
echo "❌ Erreurs: $errors/$total_lines"

if [[ $success -gt 0 ]]; then
    echo ""
    echo "🎉 IMPORT RÉUSSI !"
    echo "🔗 Vérifiez: Admin → Content → Metaobjects"
    echo ""
    echo "🌈 Système de couleurs opérationnel !"
else
    echo ""
    echo "❌ Aucun import réussi"
    echo "💡 Vérifiez les permissions et la configuration"
fi

echo ""
echo "✨ Terminé !"
