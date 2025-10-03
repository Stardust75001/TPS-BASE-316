#!/bin/bash

echo "🚨 === CORRECTION URGENTE: THEME.LIQUID CORROMPU ==="
echo "Problème détecté: Code JavaScript mélangé dans le HTML"
echo "Solution: Restaurer la structure propre"
echo ""

echo "🔍 Sauvegarde du fichier actuel..."
cp layout/theme.liquid layout/theme.liquid.backup.$(date +%s)

echo "🧹 Nettoyage du code JavaScript corrompu..."

# Rechercher les lignes problématiques
echo "Lignes avec code JS corrompu:"
grep -n "async function\|tryFetchEval\|loadScriptHybrid" layout/theme.liquid | head -5

echo ""
echo "🎯 Actions requises:"
echo "   1. Supprimer le code JavaScript inline corrompu"
echo "   2. Garder uniquement les références aux fichiers .js"
echo "   3. S'assurer que hybrid-script-loader-v3.js est référencé"
echo "   4. Maintenir asset-fallbacks.js"

echo ""
echo "✅ STRUCTURE CORRECTE ATTENDUE:"
echo '   <script>window.assetUrls = {...};</script>'
echo '   <script src="{{ "asset-fallbacks.js" | asset_url }}"></script>'
echo '   <script src="{{ "hybrid-script-loader-v3.js" | asset_url }}"></script>'

echo ""
echo "⚠️  Le système hybride ne fonctionne pas car le theme.liquid est corrompu"
echo "   Les erreurs MIME persistent à cause de ce problème structurel"
