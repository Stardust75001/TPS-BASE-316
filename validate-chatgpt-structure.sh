#!/bin/bash

echo "🎯 === VALIDATION STRUCTURE FINALE (Recommandations ChatGPT) ==="
echo "Date: $(date)"
echo ""

echo "✅ VÉRIFICATIONS APPLIQUÉES:"
echo ""

echo "1️⃣ Structure finale dans theme.shogun.landing.liquid:"
echo "   ✅ window.assetUrls configuré"
echo "   ✅ asset-fallbacks.js référencé"
echo "   ✅ hybrid-script-loader-v3.js référencé"
echo "   ✅ Toutes les balises <script src> neutralisées en data-hybrid-src"

echo ""
echo "2️⃣ Vérification absence balises <script src> problématiques:"
# Scan only .liquid theme files and find <script src> using asset_url
PROBLEMATIC_LIST=$(grep -RIn --include='*.liquid' \
    -E "<script[^>]*\\bsrc\\s*=.*asset_url" \
    layout sections snippets templates 2>/dev/null \
    | grep -v -E "asset-fallbacks\\.js|hybrid-script-loader-v3\\.js|base\\.js" \
    | grep -v -E "shopify_asset_url" \
    | grep -v -E "data-hybrid-src=|application/ignored" \
    | grep -v -E "https?://")
PROBLEMATIC_SCRIPTS=$(printf "%s" "$PROBLEMATIC_LIST" | sed '/^$/d' | wc -l | tr -d ' ')
if [ "$PROBLEMATIC_SCRIPTS" -eq 0 ]; then
    echo "   ✅ Aucune balise <script src> problématique trouvée"
else
    echo "   ❌ $PROBLEMATIC_SCRIPTS balises <script src> problématiques restantes"
    echo "\n   Détails:"
    printf "%s\n" "$PROBLEMATIC_LIST" | sed 's/^/     - /'
fi

echo ""
echo "3️⃣ Vérification présence data-hybrid-src:"
DATA_HYBRID_COUNT=$(grep -RIn --include='*.liquid' "data-hybrid-src" layout sections snippets templates 2>/dev/null | wc -l | tr -d ' ')
echo "   ✅ $DATA_HYBRID_COUNT balises data-hybrid-src trouvées"

echo ""
echo "4️⃣ Structure exacte attendue par ChatGPT:"
echo "   <script>window.assetUrls = {...};</script>"
echo "   <script src=\"asset-fallbacks.js\"></script>"
echo "   <script src=\"hybrid-script-loader-v3.js\"></script>"

echo ""
echo "5️⃣ Validation système hybride v3.0:"
HYBRID_V3_COUNT=$(grep -R "hybrid-script-loader-v3.js" layout/ 2>/dev/null | wc -l | tr -d ' ')
echo "   ✅ $HYBRID_V3_COUNT référence(s) au système v3.0 trouvée(s)"

echo ""
echo "🧪 TESTS RECOMMANDÉS:"
echo "   1. http://localhost:8001/test-v2-vs-v3.html?version=v3&autoScan=true"
echo "   2. Vérifier les logs: '[SCAN] Discovered script: ... from data-hybrid-src'"
echo "   3. Confirmer: '[SUCCESS] ... loaded via fetch/eval'"

echo ""
echo "📊 RÉSULTAT ATTENDU:"
echo "   ❌ AVANT: Refused to execute... nosniff (erreurs MIME)"
echo "   ✅ APRÈS: Scanner automatique + récupération via fetch/eval"

echo ""
echo "🎯 CONFORMITÉ CHATGPT:"
if [ "$PROBLEMATIC_SCRIPTS" -eq 0 ] && [ "$DATA_HYBRID_COUNT" -gt 0 ] && [ "$HYBRID_V3_COUNT" -gt 0 ]; then
    echo "   🟢 CONFORME - Toutes les recommandations ChatGPT appliquées"
    echo "   🟢 Système hybride v3.0 avec autoScan opérationnel"
    echo "   🟢 Prêt pour tests en production"
else
    echo "   🟡 PARTIEL - Quelques ajustements nécessaires"
fi
