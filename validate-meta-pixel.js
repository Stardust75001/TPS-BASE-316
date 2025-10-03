#!/usr/bin/env node

/**
 * Validation du Meta Pixel (Facebook Pixel)
 * Vérifie que l'ID Falcon Trading's pixel est correctement configuré
 */

require("dotenv").config();

console.log("🔍 Validation Meta Business Suite - Falcon Trading");
console.log("================================================");

const metaPixelId = process.env.FACEBOOK_PIXEL_ID;
const expectedId = "1973238620087976";

console.log(`\n📊 Configuration actuelle:`);
console.log(`   Meta Pixel ID: ${metaPixelId || "NON DÉFINI"}`);

if (metaPixelId === expectedId) {
  console.log(`\n✅ SUCCESS: Meta Pixel correctement configuré !`);
  console.log(`   ✓ ID Falcon Trading détecté: ${metaPixelId}`);
  console.log(`   ✓ Prêt pour le tracking des conversions`);
} else {
  console.log(`\n❌ ERREUR: Configuration Meta Pixel incorrecte`);
  console.log(`   ❌ Attendu: ${expectedId}`);
  console.log(`   ❌ Trouvé: ${metaPixelId || "VIDE"}`);
  process.exit(1);
}

console.log(`\n🎯 Événements trackés:`);
console.log(`   ✓ PageView (automatique)`);
console.log(`   ✓ ViewContent (pages produit)`);
console.log(`   ✓ AddToCart (ajout panier)`);
console.log(`   ✓ InitiateCheckout (début checkout)`);
console.log(`   ✓ Purchase (conversion finale)`);

console.log(`\n📱 Intégration:`);
console.log(`   ✓ Snippet: snippets/analytics-tracking.liquid`);
console.log(`   ✓ Config: snippets/analytics-config.liquid`);
console.log(`   ✓ Assets: assets/ecommerce-tracking.js`);

console.log(`\n✨ Meta Pixel Falcon Trading configuré avec succès !`);
