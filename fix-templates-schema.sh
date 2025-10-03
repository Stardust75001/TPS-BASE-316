#!/bin/bash

echo "Suppression des propriétés 'templates' invalides..."

# Liste des fichiers à corriger
files=(
    "sections/quiz.liquid"
    "sections/recommended-products.liquid"
    "sections/sticky-atc.liquid"
    "sections/template-article.liquid"
    "sections/template-blog.liquid"
    "sections/template-cart.liquid"
    "sections/template-collection-bundle.liquid"
    "sections/template-password.liquid"
    "sections/template-product.liquid"
    "sections/template-search.liquid"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "Correction de $file..."
        sed -i.bak 's/"templates": \[[^]]*\],//g' "$file"
        rm -f "${file}.bak"
    fi
done

echo "Correction terminée!"
