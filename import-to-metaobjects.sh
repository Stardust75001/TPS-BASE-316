#!/bin/bash

echo "🌈 IMPORT COULEURS VERS METAOBJECTS SHOPIFY"
echo "==========================================="

# Vérification de la connexion Shopify
if ! shopify whoami > /dev/null 2>&1; then
    echo "❌ Non connecté à Shopify"
    echo "💡 Exécutez: shopify auth login"
    exit 1
fi

echo "✅ Connecté à Shopify: $(shopify whoami | grep Store:)"

# Vérification du fichier CSV
if [ ! -f "css-colors-import.csv" ]; then
    echo "❌ Fichier css-colors-import.csv non trouvé"
    exit 1
fi

echo "✅ Fichier CSV trouvé"

# Import via GraphQL (méthode 1)
echo ""
echo "📤 MÉTHODE 1: Import via Shopify GraphQL"
echo "-----------------------------------------"

# Créer quelques couleurs test d'abord
colors=(
    "Blue,#0000FF,blue"
    "Green,#008000,green" 
    "Yellow,#FFFF00,yellow"
    "Black,#000000,black"
    "White,#FFFFFF,white"
    "Orange,#FFA500,orange"
    "Purple,#800080,purple"
    "Pink,#FFC0CB,pink"
)

for color_data in "${colors[@]}"; do
    IFS=',' read -r name hex code <<< "$color_data"
    echo "📤 Import: $name ($hex)"
    
    # Créer la mutation GraphQL
    cat > temp_mutation.graphql << GRAPHQL
mutation {
  metaobjectCreate(metaobject: {
    type: "colors"
    fields: [
      {key: "display_name", value: "$name"}
      {key: "hex_value", value: "$hex"}
      {key: "css_name", value: "$code"}
    ]
  }) {
    metaobject {
      id
      handle
    }
    userErrors {
      field
      message
    }
  }
}
GRAPHQL

    # Exécuter la mutation
    if shopify app exec graphql --file=temp_mutation.graphql > /dev/null 2>&1; then
        echo "✅ $name importé avec succès"
    else
        echo "⚠️ Erreur import $name"
    fi
    
    # Délai entre les requêtes
    sleep 0.5
done

# Nettoyer
rm -f temp_mutation.graphql

echo ""
echo "🎯 IMPORT TERMINÉ"
echo "================"
echo "✅ Couleurs de base ajoutées aux metaobjects"
echo "🔗 Vérifiez dans: Admin > Content > Metaobjects > CSS Colors"
echo ""
echo "💡 Pour importer TOUTES les couleurs (147), utilisez l'interface CSV"
