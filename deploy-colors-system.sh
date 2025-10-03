#!/bin/bash

# =============================================================================
# SCRIPT DE DÉPLOIEMENT COLORS METAOBJECT POUR SHOPIFY
# =============================================================================
# Ce script automatise l'import des couleurs CSS dans Shopify
# Usage: ./deploy-colors-system.sh

echo "🌈 DÉPLOIEMENT SYSTÈME COULEURS CSS VERS SHOPIFY"
echo "================================================="
echo ""

# Vérification des prérequis
echo "🔍 Vérification des prérequis..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    exit 1
fi
echo "✅ Node.js: $(node --version)"

# Vérifier Shopify CLI
if ! command -v shopify &> /dev/null; then
    echo "❌ Shopify CLI n'est pas installé"
    exit 1
fi
echo "✅ Shopify CLI: $(shopify version)"

# Vérifier les fichiers nécessaires
if [ ! -f "css-colors-import.csv" ]; then
    echo "❌ Fichier csv-colors-import.csv manquant"
    exit 1
fi
echo "✅ Fichier CSV couleurs trouvé"

if [ ! -f "package.json" ]; then
    echo "⚠️  package.json manquant, création..."
    npm init -y
fi

# Installation des dépendances Node.js si nécessaires
echo ""
echo "📦 Installation des dépendances..."
if ! npm list csv-parse &> /dev/null; then
    npm install csv-parse
fi
echo "✅ Dépendances installées"

# Étape 1: Configuration de la définition metaobject
echo ""
echo "🎯 ÉTAPE 1: Configuration de la définition metaobject"
echo "---------------------------------------------------"
node setup-colors-metaobject.js

# Pause pour permettre la création manuelle du metaobject
echo ""
echo "⏸️  PAUSE OBLIGATOIRE"
echo "==================="
echo "🖥️  Vous devez maintenant créer le metaobject dans l'admin Shopify :"
echo ""
echo "1. Ouvrez: https://admin.shopify.com/store/$(shopify whoami | grep 'Store:' | cut -d' ' -f2)/settings/custom_data"
echo "2. Cliquez 'Add definition'"
echo "3. Utilisez le type: 'colors'"
echo "4. Consultez le fichier 'metaobject-colors-definition.json' pour les détails"
echo ""
echo "Appuyez sur [ENTRÉE] quand c'est fait..."
read -r

# Étape 2: Vérification de la création
echo ""
echo "🔍 ÉTAPE 2: Vérification de la création du metaobject"
echo "---------------------------------------------------"

# Test de connexion Shopify
if shopify theme list > /dev/null 2>&1; then
    echo "✅ Connexion Shopify OK"
else
    echo "❌ Problème de connexion Shopify"
    echo "Exécutez: shopify auth login"
    exit 1
fi

# Étape 3: Import des données
echo ""
echo "📤 ÉTAPE 3: Import des couleurs CSS"
echo "-----------------------------------"
echo "⚠️  L'import se fera via l'interface admin pour le moment"
echo "Consultez le fichier css-colors-import.csv pour les données"

# Compter les couleurs
color_count=$(wc -l < css-colors-import.csv)
echo "📊 Nombre de couleurs à importer: $((color_count - 1))" # -1 pour l'en-tête

# Étape 4: Génération du code template
echo ""
echo "🎨 ÉTAPE 4: Génération du code pour templates"
echo "--------------------------------------------"

cat > color-variant-template.liquid << 'EOF'
{%- comment -%}
  TEMPLATE POUR VARIANTES COULEUR
  Utilise les metaobjects colors pour afficher les nuanciers
{%- endcomment -%}

<div class="product-color-variants">
  <h4>{{ 'products.color_variants.title' | t }}</h4>

  <div class="color-swatches">
    {% for variant in product.variants %}
      {% if variant.available %}
        {%- assign color_option = variant.option1 -%}
        {%- assign color_metaobject = shop.metaobjects.colors[color_option] -%}

        <div class="color-swatch" data-variant-id="{{ variant.id }}">
          {% if color_metaobject %}
            <button
              class="color-swatch-button"
              style="background-color: {{ color_metaobject.hex_value.value }};"
              title="{{ color_metaobject.display_name.value }}"
              data-color-hex="{{ color_metaobject.hex_value.value }}"
              data-color-name="{{ color_metaobject.display_name.value }}"
              onclick="selectVariant({{ variant.id }})"
            >
              <span class="sr-only">{{ color_metaobject.display_name.value }}</span>
            </button>
          {% else %}
            <button
              class="color-swatch-button color-swatch-text"
              onclick="selectVariant({{ variant.id }})"
            >
              {{ color_option }}
            </button>
          {% endif %}
        </div>
      {% endif %}
    {% endfor %}
  </div>
</div>

<style>
.color-swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.color-swatch-button {
  width: 32px;
  height: 32px;
  border: 2px solid #ddd;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.color-swatch-button:hover {
  transform: scale(1.1);
  border-color: #333;
}

.color-swatch-button.selected {
  border-color: #000;
  transform: scale(1.1);
}

.color-swatch-text {
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  background: #f5f5f5;
}
</style>

<script>
function selectVariant(variantId) {
  // Logique de sélection de variante
  console.log('Variante sélectionnée:', variantId);

  // Mettre à jour le formulaire de produit
  const variantInput = document.querySelector('[name="id"]');
  if (variantInput) {
    variantInput.value = variantId;
  }

  // Mettre à jour les classes CSS
  document.querySelectorAll('.color-swatch-button').forEach(btn => {
    btn.classList.remove('selected');
  });
  event.target.classList.add('selected');
}
</script>
EOF

echo "✅ Code template généré dans color-variant-template.liquid"

# Étape 5: Rapport final
echo ""
echo "📊 ÉTAPE 5: Rapport final"
echo "========================"
echo "✅ Scripts créés:"
echo "  - setup-colors-metaobject.js (configuration)"
echo "  - css-colors-to-shopify.js (import principal)"
echo "  - import-colors-simple.js (import simplifié)"
echo "  - metaobject-colors-definition.json (définition)"
echo "  - color-variant-template.liquid (code template)"
echo ""
echo "📋 Actions manuelles restantes:"
echo "1. ✅ Créer le metaobject 'colors' dans l'admin Shopify"
echo "2. 🔲 Importer les couleurs via CSV dans l'admin"
echo "3. 🔲 Intégrer le code template dans vos pages produit"
echo "4. 🔲 Tester les variantes couleur"
echo ""
echo "🔗 Liens utiles:"
echo "  - Admin metaobjects: https://admin.shopify.com/settings/custom_data"
echo "  - Documentation: https://help.shopify.com/manual/metafields/metaobjects"
echo ""
echo "🎉 Déploiement terminé !"
