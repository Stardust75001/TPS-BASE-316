#!/bin/bash

# IMPORT OPTIMISÉ AVEC GESTION RATE LIMITS
# Gestion intelligente des erreurs 429, retry automatique, sauvegarde progression

set -euo pipefail  # Arrêt sur erreur, variables non définies, erreurs de pipe

# Configuration
TOKEN="shpat_REDACTED"
SHOP="f6d72e-0f"
API_VERSION="2025-01"
API_URL="https://${SHOP}.myshopify.com/admin/api/${API_VERSION}/metaobjects.json"
CSV_FILE="css-colors-import.csv"
PROGRESS_FILE=".import_progress.txt"
LOG_FILE="import.log"

# Couleurs pour le terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration rate limiting
MAX_RETRIES=3
BASE_DELAY=1.0
MAX_DELAY=10.0
RATE_LIMIT_DELAY=30.0

echo -e "${BLUE}🌈 IMPORT OPTIMISÉ - COULEURS CSS${NC}"
echo "=================================="
echo "📅 $(date)"
echo "🏪 Shop: $SHOP"
echo "🔗 API: $API_VERSION"
echo ""

# Fonction de logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Fonction pour calculer le délai exponentiel
calculate_delay() {
    local attempt=$1
    local delay=$(echo "$BASE_DELAY * (2 ^ ($attempt - 1))" | bc -l)
    local max_delay_int=${MAX_DELAY%.*}
    local delay_int=${delay%.*}

    if [ "$delay_int" -gt "$max_delay_int" ]; then
        echo "$MAX_DELAY"
    else
        echo "$delay"
    fi
}

# Fonction pour créer un metaobject avec retry intelligent
create_metaobject_with_retry() {
    local name="$1"
    local hex="$2"
    local code="$3"
    local attempt=1

    # Échapper les caractères spéciaux pour JSON
    name=$(echo "$name" | sed 's/"/\\"/g' | sed "s/'/\\'/g")

    while [ $attempt -le $MAX_RETRIES ]; do
        # JSON payload sécurisé
        local json=$(jq -n \
            --arg type "colors" \
            --arg display_name "$name" \
            --arg hex_value "$hex" \
            --arg css_name "$code" \
            '{
                metaobject: {
                    type: $type,
                    fields: [
                        {key: "display_name", value: $display_name},
                        {key: "hex_value", value: $hex_value},
                        {key: "css_name", value: $css_name}
                    ]
                }
            }')

        # Appel API avec headers complets
        local response=$(curl -s -w "%{http_code}|%{time_total}|%{size_download}" \
            -X POST \
            -H "Content-Type: application/json" \
            -H "X-Shopify-Access-Token: $TOKEN" \
            -H "User-Agent: ColorImporter/1.0" \
            -d "$json" \
            "$API_URL" 2>/dev/null)

        # Parser la réponse
        local status_code=$(echo "$response" | cut -d'|' -f1 | tail -c 4)
        local time_total=$(echo "$response" | cut -d'|' -f2)
        local response_body=$(echo "$response" | sed 's/|[^|]*|[^|]*$//')

        case "$status_code" in
            "201")
                # Succès
                log "✅ $name créé avec succès (${time_total}s)"
                echo "success"
                return 0
                ;;
            "429")
                # Rate limit
                echo -e "${YELLOW}⏳ Rate limit (tentative $attempt/$MAX_RETRIES)${NC}"
                log "⚠️  Rate limit pour $name - tentative $attempt"

                # Extraire Retry-After du header si disponible
                local retry_after=$RATE_LIMIT_DELAY

                if [ $attempt -eq $MAX_RETRIES ]; then
                    echo -e "${RED}❌ Rate limit persistant${NC}"
                    echo "rate_limit"
                    return 1
                fi

                echo -e "${YELLOW}⏱️  Attente ${retry_after}s...${NC}"
                sleep "$retry_after"
                ;;
            "422")
                # Erreur de validation (probablement duplicata)
                if echo "$response_body" | grep -q "taken\|exists\|duplicate"; then
                    echo -e "${YELLOW}⚠️  Duplicata détecté${NC}"
                    log "⚠️  $name existe déjà"
                    echo "duplicate"
                    return 0
                else
                    echo -e "${RED}❌ Erreur de validation${NC}"
                    log "❌ Validation error pour $name: $response_body"
                    echo "validation_error"
                    return 1
                fi
                ;;
            "406"|"401"|"403")
                # Erreur de permissions ou configuration
                echo -e "${RED}❌ Erreur de permissions/config${NC}"
                log "❌ Permission error pour $name: HTTP $status_code"
                echo "permission_error"
                return 1
                ;;
            *)
                # Autres erreurs - retry avec délai exponentiel
                local delay=$(calculate_delay $attempt)
                echo -e "${YELLOW}⚠️  HTTP $status_code (tentative $attempt/$MAX_RETRIES)${NC}"
                log "⚠️  HTTP $status_code pour $name - tentative $attempt"

                if [ $attempt -eq $MAX_RETRIES ]; then
                    echo -e "${RED}❌ Échec après $MAX_RETRIES tentatives${NC}"
                    echo "failed"
                    return 1
                fi

                echo -e "${YELLOW}⏱️  Retry dans ${delay}s...${NC}"
                sleep "$delay"
                ;;
        esac

        ((attempt++))
    done

    echo "failed"
    return 1
}

# Fonction pour sauvegarder la progression
save_progress() {
    local current_index=$1
    local success_count=$2
    local error_count=$3
    echo "$current_index|$success_count|$error_count|$(date '+%s')" > "$PROGRESS_FILE"
}

# Fonction pour charger la progression
load_progress() {
    if [ -f "$PROGRESS_FILE" ]; then
        echo "📂 Progression précédente trouvée"
        local progress=$(cat "$PROGRESS_FILE")
        echo "Reprendre à partir de: $progress"
        echo "$progress"
    else
        echo "0|0|0|$(date '+%s')"
    fi
}

# Vérifier les prérequis
if ! command -v jq &> /dev/null; then
    echo -e "${RED}❌ jq n'est pas installé. Installation: brew install jq${NC}"
    exit 1
fi

if [ ! -f "$CSV_FILE" ]; then
    echo -e "${RED}❌ Fichier $CSV_FILE introuvable${NC}"
    exit 1
fi

# Charger les couleurs du CSV
log "📊 Chargement du CSV: $CSV_FILE"
colors=()
line_count=0

while IFS=',' read -r name hex code; do
    ((line_count++))

    # Skip header et lignes vides
    if [[ "$name" != "Name" && -n "$name" && -n "$hex" && -n "$code" ]]; then
        # Nettoyer les données
        name=$(echo "$name" | xargs)
        hex=$(echo "$hex" | xargs)
        code=$(echo "$code" | xargs)

        colors+=("$name|$hex|$code")
    fi
done < "$CSV_FILE"

total=${#colors[@]}
echo "📊 Total: $total couleurs valides trouvées"

# Charger progression précédente
progress_data=$(load_progress)
IFS='|' read -r start_index prev_success prev_errors start_time <<< "$progress_data"

current_success=$prev_success
current_errors=$prev_errors
skipped=0

echo ""
if [ $start_index -gt 0 ]; then
    echo -e "${BLUE}🔄 Reprise de l'import à partir de la position $start_index${NC}"
fi

# Variables pour statistiques
start_time_import=$(date +%s)
estimated_time=""

log "🚀 Début de l'import - Position: $start_index/$total"

# Import principal avec gestion d'erreurs
for i in $(seq $start_index $((total - 1))); do
    IFS='|' read -r name hex code <<< "${colors[$i]}"

    progress=$((i + 1))

    # Calcul du temps estimé
    if [ $progress -gt $(($start_index + 5)) ]; then
        local elapsed=$(($(date +%s) - start_time_import))
        local rate=$(echo "scale=2; ($progress - $start_index) / $elapsed" | bc -l)
        local remaining=$((total - progress))
        local eta=$(echo "scale=0; $remaining / $rate" | bc -l)
        estimated_time=$(echo "ETA: ${eta}s")
    fi

    echo -ne "\r📤 [$progress/$total] $name ($hex) $estimated_time... "

    # Créer le metaobject
    result=$(create_metaobject_with_retry "$name" "$hex" "$code")

    case "$result" in
        "success")
            echo -e "${GREEN}✅${NC}"
            ((current_success++))
            ;;
        "duplicate")
            echo -e "${YELLOW}🔄${NC}"
            ((skipped++))
            ;;
        "rate_limit")
            echo -e "${RED}⏰${NC}"
            ((current_errors++))
            log "❌ Rate limit persistant - arrêt de l'import"
            break
            ;;
        *)
            echo -e "${RED}❌${NC}"
            ((current_errors++))
            ;;
    esac

    # Sauvegarder la progression tous les 10 éléments
    if [ $((progress % 10)) -eq 0 ]; then
        save_progress $progress $current_success $current_errors
    fi

    # Délai adaptatif basé sur le succès
    if [ "$result" = "success" ]; then
        sleep $BASE_DELAY
    else
        sleep $(echo "$BASE_DELAY * 1.5" | bc -l)
    fi
done

# Nettoyage final
rm -f "$PROGRESS_FILE"
end_time=$(date +%s)
duration=$((end_time - start_time_import))

# Rapport final détaillé
echo ""
echo "========================================"
echo -e "${BLUE}📊 RAPPORT FINAL${NC}"
echo "========================================"
echo "⏱️  Durée: ${duration}s ($(date -u -r $duration +%H:%M:%S))"
echo "✅ Succès: $current_success"
echo "🔄 Doublons: $skipped"
echo "❌ Erreurs: $current_errors"
echo "📊 Total traité: $((current_success + skipped + current_errors))/$total"

# Taux de réussite
if [ $total -gt 0 ]; then
    success_rate=$(echo "scale=1; ($current_success + $skipped) * 100 / $total" | bc -l)
    echo "📈 Taux de réussite: ${success_rate}%"
fi

if [ $current_success -gt 0 ] || [ $skipped -gt 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 IMPORT TERMINÉ AVEC SUCCÈS !${NC}"
    echo "🔗 Admin: https://admin.shopify.com/store/$SHOP/content/metaobjects"
    echo "🌈 Vos couleurs CSS sont maintenant disponibles !"

    log "✅ Import terminé - Succès: $current_success, Doublons: $skipped, Erreurs: $current_errors"
else
    echo ""
    echo -e "${RED}❌ Import échoué${NC}"
    echo "💡 Vérifiez les logs dans $LOG_FILE"

    log "❌ Import échoué - Aucune couleur importée"
fi

echo ""
echo "📋 Logs détaillés: $LOG_FILE"
echo "✨ Terminé à $(date)"
