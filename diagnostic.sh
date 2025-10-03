#!/bin/bash

# SCRIPT DE DIAGNOSTIC SIMPLE

TOKEN="shpat_REDACTED"
SHOP="f6d72e-0f"
API_VERSION="2025-01"

echo "=== TEST DE CONNECTIVITÉ ==="

# Test 1: Connectivité de base
echo "Test 1: Connectivité Shop API"
response=$(curl -s -w "%{http_code}" \
  -H "X-Shopify-Access-Token: $TOKEN" \
  "https://$SHOP.myshopify.com/admin/api/$API_VERSION/shop.json" \
  -o /tmp/shop_response.json)

status_code="${response: -3}"
echo "Status: $status_code"

if [[ "$status_code" == "200" ]]; then
  echo "✓ Connectivité OK"
else
  echo "✗ Erreur de connectivité"
  cat /tmp/shop_response.json
fi

echo ""

# Test 2: Vérification définition metaobject
echo "Test 2: Définition metaobject 'colors'"
response=$(curl -s -w "%{http_code}" \
  -H "X-Shopify-Access-Token: $TOKEN" \
  "https://$SHOP.myshopify.com/admin/api/$API_VERSION/metaobject_definitions.json" \
  -o /tmp/definitions_response.json)

status_code="${response: -3}"
echo "Status: $status_code"

if [[ "$status_code" == "200" ]]; then
  # Vérifier si la définition 'colors' existe
  colors_exists=$(cat /tmp/definitions_response.json | jq -r '.metaobject_definitions[] | select(.type == "colors") | .type' 2>/dev/null)

  if [[ "$colors_exists" == "colors" ]]; then
    echo "✓ Définition 'colors' trouvée"
  else
    echo "✗ Définition 'colors' manquante"
    echo "Définitions disponibles:"
    cat /tmp/definitions_response.json | jq -r '.metaobject_definitions[].type' 2>/dev/null || echo "Aucune"
  fi
else
  echo "✗ Erreur accès définitions"
  cat /tmp/definitions_response.json
fi

echo ""

# Test 3: Création test
echo "Test 3: Création d'un metaobject test"

test_payload=$(cat <<EOF
{
  "metaobject": {
    "type": "colors",
    "fields": {
      "display_name": "Diagnostic Red",
      "hex_value": "#FF0000",
      "css_name": "diagnostic-red"
    }
  }
}
EOF
)

response=$(curl -s -w "%{http_code}" \
  -X POST \
  -H "X-Shopify-Access-Token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$test_payload" \
  "https://$SHOP.myshopify.com/admin/api/$API_VERSION/metaobjects.json" \
  -o /tmp/create_response.json)

status_code="${response: -3}"
echo "Status: $status_code"

if [[ "$status_code" == "201" ]]; then
  echo "✓ Création réussie"
  created_id=$(cat /tmp/create_response.json | jq -r '.metaobject.id' 2>/dev/null)
  echo "ID créé: $created_id"

  # Nettoyage
  if [[ -n "$created_id" && "$created_id" != "null" ]]; then
    echo "Nettoyage du test..."
    curl -s -X DELETE \
      -H "X-Shopify-Access-Token: $TOKEN" \
      "https://$SHOP.myshopify.com/admin/api/$API_VERSION/metaobjects/$created_id.json" >/dev/null
    echo "✓ Test nettoyé"
  fi
elif [[ "$status_code" == "422" ]]; then
  echo "⚠ Erreur de validation (peut-être un doublon)"
  cat /tmp/create_response.json | jq -r '.errors // "Pas d'erreurs détaillées"' 2>/dev/null
else
  echo "✗ Erreur de création"
  cat /tmp/create_response.json
fi

echo ""
echo "=== FIN DU DIAGNOSTIC ==="

# Nettoyage
rm -f /tmp/shop_response.json /tmp/definitions_response.json /tmp/create_response.json
