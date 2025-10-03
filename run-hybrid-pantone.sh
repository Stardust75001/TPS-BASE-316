#!/bin/bash

# Script de lancement unifié pour le gestionnaire hybride Pantone
# Combine les approches directe API et CSV style ChatGPT

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HYBRID_SCRIPT="$SCRIPT_DIR/hybrid-pantone-manager.cjs"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🚀 Gestionnaire Hybride de Métadonnées Pantone${NC}"
echo "========================================================="
echo -e "${CYAN}Combine l'approche API directe + enrichissement CSV${NC}"
echo ""

# Vérifications
if [ ! -f "$HYBRID_SCRIPT" ]; then
    echo -e "${RED}❌ Script hybride introuvable: $HYBRID_SCRIPT${NC}"
    exit 1
fi

if [ ! -f "$SCRIPT_DIR/.env" ]; then
    echo -e "${YELLOW}⚠️ Fichier .env manquant${NC}"
    echo "Veuillez créer un fichier .env avec vos identifiants Shopify"
    exit 1
fi

# Déterminer l'opération
OPERATION="${1:-preview}"

case "$OPERATION" in
    "preview"|"p")
        echo -e "${BLUE}👁️ Mode Prévisualisation${NC}"
        echo "Analyse des métaobjects sans modification"
        echo ""
        node "$HYBRID_SCRIPT" preview
        ;;

    "csv-export"|"export"|"e")
        FILENAME="${2:-pantone-export-$(date +%Y%m%d-%H%M%S).csv}"
        echo -e "${CYAN}📄 Mode Export CSV${NC}"
        echo "Export vers: $FILENAME"
        echo ""
        node "$HYBRID_SCRIPT" csv-export "$FILENAME"
        ;;

    "csv-import"|"import"|"i")
        FILENAME="$2"
        if [ -z "$FILENAME" ]; then
            echo -e "${RED}❌ Nom du fichier CSV requis${NC}"
            echo "Usage: $0 csv-import fichier.csv"
            exit 1
        fi
        echo -e "${CYAN}📥 Mode Import CSV${NC}"
        echo "Import depuis: $FILENAME"
        echo ""
        node "$HYBRID_SCRIPT" csv-import "$FILENAME"
        ;;

    "api-direct"|"direct"|"d")
        echo -e "${GREEN}🚀 Mode API Direct${NC}"
        echo "Mise à jour directe via API Shopify"
        echo ""
        read -p "Confirmer l'exécution? (oui/NON): " -r
        if [[ $REPLY =~ ^[Oo][Uu][Ii]$ ]]; then
            node "$HYBRID_SCRIPT" api-direct
        else
            echo -e "${YELLOW}❌ Opération annulée${NC}"
        fi
        ;;

    "hybrid"|"h")
        echo -e "${PURPLE}🔄 Mode Hybride${NC}"
        echo "Combine export CSV + enrichissement + import"
        echo ""
        read -p "Confirmer l'exécution hybride? (oui/NON): " -r
        if [[ $REPLY =~ ^[Oo][Uu][Ii]$ ]]; then
            node "$HYBRID_SCRIPT" hybrid
        else
            echo -e "${YELLOW}❌ Opération annulée${NC}"
        fi
        ;;

    "workflow"|"w")
        echo -e "${PURPLE}🔄 Workflow Complet${NC}"
        echo "Exécution étape par étape du processus hybride"
        echo ""

        echo -e "${BLUE}Étape 1/4: Prévisualisation${NC}"
        node "$HYBRID_SCRIPT" preview
        echo ""

        read -p "Continuer avec l'export CSV? (oui/NON): " -r
        if [[ ! $REPLY =~ ^[Oo][Uu][Ii]$ ]]; then
            echo -e "${YELLOW}Workflow interrompu${NC}"
            exit 0
        fi

        TEMP_CSV="pantone-workflow-$(date +%Y%m%d-%H%M%S).csv"
        echo -e "${CYAN}Étape 2/4: Export CSV${NC}"
        node "$HYBRID_SCRIPT" csv-export "$TEMP_CSV"
        echo ""

        echo -e "${YELLOW}Étape 3/4: Révision du CSV${NC}"
        echo "Fichier CSV créé: $TEMP_CSV"
        echo "Vous pouvez maintenant l'éditer avec Excel/Numbers si nécessaire"
        read -p "Continuer avec l'import? (oui/NON): " -r
        if [[ ! $REPLY =~ ^[Oo][Uu][Ii]$ ]]; then
            echo -e "${YELLOW}Workflow interrompu. CSV sauvegardé: $TEMP_CSV${NC}"
            exit 0
        fi

        echo -e "${GREEN}Étape 4/4: Import et Application${NC}"
        node "$HYBRID_SCRIPT" csv-import "$TEMP_CSV"

        # Optionnel: supprimer le fichier temporaire
        read -p "Supprimer le fichier CSV temporaire? (oui/NON): " -r
        if [[ $REPLY =~ ^[Oo][Uu][Ii]$ ]]; then
            rm "$TEMP_CSV"
            echo -e "${GREEN}✅ Fichier temporaire supprimé${NC}"
        else
            echo -e "${BLUE}📁 CSV sauvegardé: $TEMP_CSV${NC}"
        fi
        ;;

    "help"|"-h"|"--help")
        echo "Usage: $0 [OPERATION] [OPTIONS]"
        echo ""
        echo "Opérations disponibles:"
        echo "  preview     (p)  - Prévisualise les changements sans les appliquer"
        echo "  csv-export  (e)  - Exporte les métaobjects vers un fichier CSV"
        echo "  csv-import  (i)  - Importe et applique depuis un fichier CSV"
        echo "  api-direct  (d)  - Met à jour directement via l'API Shopify"
        echo "  hybrid      (h)  - Mode hybride automatique (export + enrichissement + import)"
        echo "  workflow    (w)  - Workflow interactif étape par étape"
        echo "  help             - Affiche cette aide"
        echo ""
        echo "Exemples:"
        echo "  $0 preview                           # Prévisualisation"
        echo "  $0 csv-export mon-export.csv         # Export vers CSV"
        echo "  $0 csv-import mon-import.csv         # Import depuis CSV"
        echo "  $0 api-direct                        # Mise à jour directe"
        echo "  $0 hybrid                            # Mode hybride complet"
        echo "  $0 workflow                          # Workflow interactif"
        echo ""
        echo "Fonctionnalités hybrides:"
        echo "  ✅ Mapping Pantone étendu (400+ couleurs)"
        echo "  ✅ Support CSV pour édition manuelle"
        echo "  ✅ API directe pour rapidité"
        echo "  ✅ Enrichissement automatique des données"
        echo "  ✅ Mode interactif sécurisé"
        ;;

    *)
        echo -e "${RED}❌ Opération inconnue: $OPERATION${NC}"
        echo ""
        echo "Opérations disponibles:"
        echo "  preview, csv-export, csv-import, api-direct, hybrid, workflow, help"
        echo ""
        echo "Utilisez '$0 help' pour plus de détails"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Opération terminée!${NC}"
