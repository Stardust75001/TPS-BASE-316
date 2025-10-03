#!/bin/bash
# Script: create-pantone-metaobjects.sh
# Usage: ./create-pantone-metaobjects.sh <pantone-list.csv>
# CSV format: code,name,hex

if [ -z "$1" ]; then
  echo "Usage: $0 <pantone-list.csv>"
  exit 1
fi

if [ ! -f .env ]; then
  echo ".env file missing."
  exit 1
fi
export $(grep -v '^#' .env | xargs)

CSV_FILE="$1"

while IFS=, read -r code name hex; do
  if [ "$code" = "code" ]; then continue; fi # skip header
  echo "Creating Pantone metaobject: $code ($name, $hex)"
  curl -sS -X POST "https://$SHOPIFY_SHOP/admin/api/2025-07/graphql.json" \
    -H "X-Shopify-Access-Token: $SHOPIFY_ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "query": "mutation($input: MetaobjectCreateInput!){ metaobjectCreate(metaobject: $input){ metaobject { id handle } userErrors { field message } } }",
      "variables": {
        "input": {
          "type": "pantone_color",
          "fields": [
            { "key": "code", "value": "'$code'" },
            { "key": "name", "value": "'$name'" },
            { "key": "hex", "value": "'$hex'" }
          ]
        }
      }
    }' | jq .
done < "$CSV_FILE"
