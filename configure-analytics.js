#!/usr/bin/env node

/**
 * Simple Analytics Configuration Helper
 * Met à jour les IDs directement dans les snippets
 */

const fs = require("fs");
const path = require("path");

// Configuration depuis .env
const GTM_ID = "GTM-P9SBYVC4";
const GA4_ID = "G-LM1PJ22ZM3";

console.log("🔧 Configuration des Analytics IDs...");

// Vérifier que les IDs sont valides
if (GTM_ID && GTM_ID.match(/^GTM-[A-Z0-9]+$/)) {
  console.log("✅ GTM ID valide:", GTM_ID);
} else {
  console.log("❌ GTM ID invalide");
}

if (GA4_ID && GA4_ID.match(/^G-[A-Z0-9]+$/)) {
  console.log("✅ GA4 ID valide:", GA4_ID);
} else {
  console.log("❌ GA4 ID invalide");
}

console.log("\n📋 Pour activer ces IDs, vous devez les saisir dans :");
console.log(
  "   Shopify Admin > Thèmes > Personnaliser > Paramètres du thème > Analytics & Tracking"
);
console.log("");
console.log("🎯 IDs à copier :");
console.log("   GTM Container ID:", GTM_ID);
console.log("   GA4 Measurement ID:", GA4_ID);
console.log("");
console.log(
  "🚀 Une fois configuré dans Shopify, GTM sera automatiquement chargé !"
);
console.log("   GA4 sera utilisé comme fallback si GTM n'est pas configuré.");
