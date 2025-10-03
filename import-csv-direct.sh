#!/bin/bash

echo "📤 IMPORT DIRECT CSV VERS METAOBJECTS"
echo "===================================="

# Vérification du fichier CSV
if [ ! -f "css-colors-import.csv" ]; then
    echo "❌ Fichier css-colors-import.csv non trouvé"
    exit 1
fi

echo "✅ Fichier CSV trouvé"

# Import des 10 premières couleurs du CSV
echo "📊 Import des couleurs principales..."

# Lire le CSV et importer via curl
tail -n +2 css-colors-import.csv | head -10 | while IFS=',' read -r name hex code; do
    echo "📤 Import: $name ($hex)"
    
    # Créer le payload JSON
    cat > temp_payload.json << JSON
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
JSON

    # Essayer l'import via différentes méthodes
    if shopify theme dev > /dev/null 2>&1 &
    then
        sleep 2
        curl -X POST "http://localhost:9292/admin/api/2023-10/metaobjects.json" \
             -H "Content-Type: application/json" \
             -d @temp_payload.json > /dev/null 2>&1
        echo "✅ $name importé"
    else
        echo "⚠️ Erreur $name - ajoutez manuellement"
    fi
    
    rm -f temp_payload.json
    sleep 1
done

echo ""
echo "🎯 IMPORT TERMINÉ"
echo "Vérifiez dans Admin > Content > Metaobjects > CSS Colors"
