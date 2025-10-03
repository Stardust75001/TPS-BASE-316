#!/bin/bash
# pantone-linker.sh: Valide et crée la définition de metafield Pantone pour les variants Shopify

# Charger les variables d'environnement depuis .env si présent

# Charger les variables d'environnement depuis .env si présent
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Vérifier que les variables nécessaires sont définies
if [ -z "$SHOPIFY_ADMIN_TOKEN" ] || [ -z "$SHOPIFY_SHOP" ]; then
  echo "Erreur: SHOPIFY_ADMIN_TOKEN ou SHOPIFY_SHOP non défini dans .env"
  exit 1
fi

API_VERSION="2023-10"
DEFINITION_NAMESPACE="color"
DEFINITION_KEY="pantone"

# Chercher l'ID de la définition existante
EXISTING=$(curl -s -X GET \
  -H "X-Shopify-Access-Token: $SHOPIFY_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  "https://$SHOPIFY_SHOP/admin/api/$API_VERSION/metafield_definitions.json?namespace=$DEFINITION_NAMESPACE&key=$DEFINITION_KEY")

DEF_ID=$(echo "$EXISTING" | grep -o '"id":"[^"]\+' | head -n1 | cut -d'"' -f4)

if [ -n "$DEF_ID" ]; then
  echo "Définition existante trouvée ($DEF_ID), suppression..."
  curl -s -X DELETE \
    -H "X-Shopify-Access-Token: $SHOPIFY_ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    "https://$SHOPIFY_SHOP/admin/api/$API_VERSION/metafield_definitions/$DEF_ID.json"
  echo "Définition supprimée."
else
  echo "Aucune définition existante."
fi

echo "Création de la définition propre..."
curl -s -X POST \
  -H "X-Shopify-Access-Token: $SHOPIFY_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  "https://$SHOPIFY_SHOP/admin/api/$API_VERSION/metafield_definitions.json" \
  -d '{
    "metafield_definition": {
      "name": "Pantone Reference",
      "namespace": "color",
      "key": "pantone",
      "description": "Pantone metaobject reference for variant",
      "type": "metaobject_reference",
      "owner_type": "variant",
      "visibleToStorefrontApi": true
    }
  }'
echo "Définition créée."
