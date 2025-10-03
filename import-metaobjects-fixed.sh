#!/bin/bash

echo "🌈 IMPORT COULEURS VERS METAOBJECTS SHOPIFY (VERSION CORRIGÉE)"
echo "=============================================================="

# Vérification de la connexion Shopify
echo "🔍 Vérification de la connexion Shopify..."

# Essayer différentes commandes pour vérifier la connexion
if shopify theme list > /dev/null 2>&1; then
    echo "✅ Connecté à Shopify (thèmes accessibles)"
    store_info=$(shopify theme list 2>/dev/null | head -1 || echo "Store connecté")
elif shopify store list > /dev/null 2>&1; then
    echo "✅ Connecté à Shopify (stores accessibles)"
elif shopify auth status > /dev/null 2>&1; then
    echo "✅ Authentifié avec Shopify"
else
    echo "❌ Non connecté à Shopify"
    echo "💡 Exécutez: shopify auth login"
    read -p "Voulez-vous vous connecter maintenant? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        shopify auth login
    else
        exit 1
    fi
fi

# Vérification du fichier CSV
if [ ! -f "css-colors-import.csv" ]; then
    echo "❌ Fichier css-colors-import.csv non trouvé"
    exit 1
fi

echo "✅ Fichier CSV trouvé ($(wc -l < css-colors-import.csv) lignes)"

echo ""
echo "📤 IMPORT VIA SHOPIFY CLI"
echo "========================="

# Couleurs de base à importer
declare -A colors=(
    ["Blue"]="#0000FF,blue"
    ["Green"]="#008000,green"
    ["Yellow"]="#FFFF00,yellow"
    ["Black"]="#000000,black"
    ["White"]="#FFFFFF,white"
    ["Orange"]="#FFA500,orange"
    ["Purple"]="#800080,purple"
    ["Pink"]="#FFC0CB,pink"
    ["Red"]="#FF0000,red"
    ["Gray"]="#808080,gray"
)

success_count=0
total_count=${#colors[@]}

for name in "${!colors[@]}"; do
    IFS=',' read -r hex code <<< "${colors[$name]}"
    echo "📤 Import: $name ($hex)"

    # Créer un fichier JSON pour la mutation
    cat > "temp_color_$name.json" << JSON
{
  "query": "mutation metaobjectCreate(\$metaobject: MetaobjectCreateInput!) { metaobjectCreate(metaobject: \$metaobject) { metaobject { id handle } userErrors { field message } } }",
  "variables": {
    "metaobject": {
      "type": "colors",
      "fields": [
        {"key": "display_name", "value": "$name"},
        {"key": "hex_value", "value": "$hex"},
        {"key": "css_name", "value": "$code"}
      ]
    }
  }
}
JSON

    # Essayer différentes méthodes d'exécution
    if shopify app exec graphql-query --file="temp_color_$name.json" > /dev/null 2>&1; then
        echo "✅ $name importé avec succès (méthode 1)"
        success_count=$((success_count + 1))
    elif shopify graphql --file="temp_color_$name.json" > /dev/null 2>&1; then
        echo "✅ $name importé avec succès (méthode 2)"
        success_count=$((success_count + 1))
    elif curl -X POST \
        -H "Content-Type: application/json" \
        -d @"temp_color_$name.json" \
        "$(shopify theme list 2>/dev/null | grep -o 'https://[^[:space:]]*' | head -1)/admin/api/2023-10/graphql.json" \
        > /dev/null 2>&1; then
        echo "✅ $name importé avec succès (méthode 3)"
        success_count=$((success_count + 1))
    else
        echo "⚠️ Erreur import $name (essayez manuellement)"
    fi

    # Nettoyer le fichier temporaire
    rm -f "temp_color_$name.json"

    # Délai entre les requêtes
    sleep 1
done

echo ""
echo "🎯 RÉSULTATS DE L'IMPORT"
echo "========================"
echo "✅ Succès: $success_count/$total_count couleurs"

if [ $success_count -gt 0 ]; then
    echo "🔗 Vérifiez dans: Admin > Content > Metaobjects > CSS Colors"
    echo ""
    echo "🧪 PROCHAINE ÉTAPE: TEST DU SYSTÈME"
    echo "==================================="
    echo "1. Allez dans Online Store > Themes"
    echo "2. Éditez votre thème actuel"
    echo "3. Dans templates/product.liquid, ajoutez:"
    echo "   {% render 'color-system-test', product: product %}"
    echo "4. Prévisualisez une page produit"
else
    echo "❌ Aucune couleur importée automatiquement"
    echo ""
    echo "🛠️ SOLUTIONS ALTERNATIVES:"
    echo "=========================="
    echo "1. Import manuel via l'interface Shopify:"
    echo "   - Admin > Content > Metaobjects > CSS Colors > Add entry"
    echo "   - Ajoutez manuellement: Blue (#0000FF, blue), Green (#008000, green), etc."
    echo ""
    echo "2. Upload CSV via l'interface:"
    echo "   - Cherchez un bouton 'Import' ou '...' dans la page CSS Colors"
    echo "   - Uploadez css-colors-import.csv"
    echo ""
    echo "3. Continuez avec les couleurs déjà créées manuellement"
fi

echo ""
echo "💡 Pour importer TOUTES les 147 couleurs, utilisez l'interface CSV Shopify"
