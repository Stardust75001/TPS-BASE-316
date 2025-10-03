#!/bin/bash

# Script de lancement pour le remplissage des métadonnées Pantone
# Usage: ./run-pantone-metadata.sh [preview|write|force]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_FILE="$SCRIPT_DIR/fill-pantone-metadata.cjs"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Script de Remplissage des Métadonnées Pantone${NC}"
echo "=================================================="

# Vérifier que le fichier de script existe
if [ ! -f "$SCRIPT_FILE" ]; then
    echo -e "${RED}❌ Erreur: $SCRIPT_FILE introuvable${NC}"
    exit 1
fi

# Vérifier que le fichier .env existe
if [ ! -f "$SCRIPT_DIR/.env" ]; then
    echo -e "${YELLOW}⚠️ Fichier .env manquant${NC}"
    echo "Création depuis .env.example.pantone..."

    if [ -f "$SCRIPT_DIR/.env.example.pantone" ]; then
        cp "$SCRIPT_DIR/.env.example.pantone" "$SCRIPT_DIR/.env"
        echo -e "${GREEN}✅ Fichier .env créé${NC}"
        echo -e "${YELLOW}🔧 Veuillez éditer .env avec vos identifiants Shopify${NC}"
        exit 1
    else
        echo -e "${RED}❌ .env.example.pantone introuvable${NC}"
        exit 1
    fi
fi

# Déterminer le mode d'exécution
MODE="${1:-preview}"

case "$MODE" in
    "preview"|"dry"|"test")
        echo -e "${BLUE}👁️ Mode Prévisualisation${NC}"
        echo "Les modifications ne seront PAS appliquées"
        echo ""
        node "$SCRIPT_FILE"
        ;;
    "write"|"apply"|"run")
        echo -e "${YELLOW}⚠️ Mode Écriture - Confirmation requise${NC}"
        echo "Les modifications seront appliquées après confirmation"
        echo ""
        node "$SCRIPT_FILE"
        echo ""
        echo -e "${YELLOW}Pour forcer l'exécution, utilisez: $0 force${NC}"
        ;;
    "force"|"auto")
        echo -e "${RED}🚨 Mode Force - Exécution automatique${NC}"
        echo "Les modifications seront appliquées IMMÉDIATEMENT"
        echo ""
        read -p "Êtes-vous sûr? (oui/NON): " -r
        if [[ $REPLY =~ ^[Oo][Uu][Ii]$ ]]; then
            echo -e "${GREEN}✅ Exécution en cours...${NC}"
            FORCE=1 node "$SCRIPT_FILE"
        else
            echo -e "${YELLOW}❌ Opération annulée${NC}"
        fi
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [MODE]"
        echo ""
        echo "Modes disponibles:"
        echo "  preview  - Affiche un aperçu des modifications (défaut)"
        echo "  write    - Execute avec demande de confirmation"
        echo "  force    - Execute immédiatement après confirmation"
        echo "  help     - Affiche cette aide"
        echo ""
        echo "Exemples:"
        echo "  $0                 # Mode prévisualisation"
        echo "  $0 preview         # Mode prévisualisation"
        echo "  $0 write           # Mode écriture avec confirmation"
        echo "  $0 force           # Mode force avec confirmation de sécurité"
        ;;
    *)
        echo -e "${RED}❌ Mode inconnu: $MODE${NC}"
        echo "Utilisez '$0 help' pour voir les modes disponibles"
        exit 1
        ;;
esac
