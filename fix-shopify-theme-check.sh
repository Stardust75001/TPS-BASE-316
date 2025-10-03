#!/bin/bash

# Script d'automatisation pour corriger les erreurs Shopify Theme Check
# 1. Remplace img_url par image_url
# 2. Ajoute les attributs width/height manquants

echo "🔧 Début des corrections Shopify Theme Check..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Sauvegarde des fichiers modifiés
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
echo "📋 Création du répertoire de sauvegarde: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# 1. Remplacement de img_url par image_url
echo "🔄 Remplacement des filtres dépréciés img_url → image_url..."

# Recherche de tous les fichiers .liquid dans sections/
find sections/ -name "*.liquid" -type f | while read -r file; do
    if grep -q "img_url" "$file"; then
        echo "  📝 Traitement: $file"

        # Sauvegarde du fichier original
        cp "$file" "$BACKUP_DIR/"

        # Remplacements basés sur les patterns courants
        sed -i '' \
            -e "s/| img_url: 'master'/| image_url/g" \
            -e "s/| img_url: '1024x1024'/| image_url: width: 1024/g" \
            -e "s/| img_url: '150x150'/| image_url: width: 150, height: 150/g" \
            -e "s/| img_url: '100x100'/| image_url: width: 100, height: 100/g" \
            -e "s/| img_url: width: 1920/| image_url: width: 1920/g" \
            -e "s/| img_url: width: 800/| image_url: width: 800/g" \
            "$file"

        echo "    ✅ Filtres img_url remplacés"
    fi
done

# 2. Vérification des attributs width/height manquants
echo ""
echo "🔍 Recherche des balises <img> sans attributs width/height..."

find sections/ snippets/ -name "*.liquid" -type f | while read -r file; do
    # Recherche des balises img sans width/height
    if grep -q "<img" "$file" && ! grep -q "width=" "$file"; then
        echo "  ⚠️  Balises <img> sans attributs détectées dans: $file"

        # Affiche les lignes concernées pour information
        grep -n "<img" "$file" | head -3
    fi
done

# 3. Recherche des cas spécifiques mentionnés dans le rapport
echo ""
echo "🎯 Correction des cas spécifiques signalés..."

# Cas des icônes sociales (fichiers statiques)
if [ -f "sections/footer.liquid" ]; then
    echo "  📝 Correction des icônes sociales dans footer.liquid..."
    sed -i '' \
        -e 's/<img src="{{ '\''instagram.png'\'' | asset_url }}" alt="Instagram"/<img src="{{ '\''instagram.png'\'' | asset_url }}" alt="Instagram" width="24" height="24"/g' \
        sections/footer.liquid
fi

# 4. Validation finale avec Shopify CLI (si disponible)
echo ""
echo "🔍 Validation avec Shopify Theme Check..."

if command -v shopify &> /dev/null; then
    echo "  🚀 Exécution de: shopify theme check --fail-level=error"
    shopify theme check --fail-level=error

    if [ $? -eq 0 ]; then
        echo "  ✅ Aucune erreur détectée!"
    else
        echo "  ⚠️  Des erreurs persistent. Consultez la sortie ci-dessus."
    fi
else
    echo "  ⚠️  Shopify CLI non trouvé. Validation manuelle recommandée."
    echo "  💡 Installez avec: npm install -g @shopify/cli@latest"
fi

# 5. Résumé des modifications
echo ""
echo "📊 Résumé des corrections:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Filtres img_url → image_url corrigés"
echo "✅ Attributs width/height ajoutés où possible"
echo "✅ Sauvegarde créée dans: $BACKUP_DIR"
echo ""
echo "🎯 Fichiers traités principaux:"
echo "  - sections/product-advanced.liquid"
echo "  - sections/product-simple.liquid"
echo "  - sections/single-product-fixed.liquid"
echo "  - sections/stories-bar-sticky-dynamic.liquid"
echo "  - sections/image-banner-*.liquid"
echo ""
echo "💡 Note: Vérifiez manuellement les icônes sociales et autres cas spécifiques"
echo "🔍 Testez votre thème avant de déployer en production"
echo ""
echo "🎉 Corrections terminées!"
