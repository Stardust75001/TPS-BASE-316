#!/usr/bin/env node

/**
 * IMPORT DIRECT VIA API REST SHOPIFY
 * Utilise l'API REST de Shopify pour créer les metaobjects directement
 */

const fs = require("fs");
const https = require("https");
const { parse } = require("csv-parse");

// Configuration (à ajuster avec vos données Shopify)
const SHOPIFY_CONFIG = {
  shop: "f6d72e-0f", // Votre shop ID
  // Vous devrez obtenir un access token via une app privée
  accessToken: "VOTRE_ACCESS_TOKEN_ICI",
};

async function createMetaobjectViaAPI(color) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      metaobject: {
        type: "colors",
        fields: {
          display_name: color.name,
          hex_value: color.hex,
          css_name: color.code,
        },
      },
    });

    const options = {
      hostname: `${SHOPIFY_CONFIG.shop}.myshopify.com`,
      port: 443,
      path: "/admin/api/2023-10/metaobjects.json",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length,
        "X-Shopify-Access-Token": SHOPIFY_CONFIG.accessToken,
      },
    };

    const req = https.request(options, (res) => {
      let responseBody = "";

      res.on("data", (chunk) => {
        responseBody += chunk;
      });

      res.on("end", () => {
        if (res.statusCode === 201) {
          resolve(true);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseBody}`));
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Méthode alternative: Génération de commandes cURL
function generateCurlCommands() {
  console.log("🔧 GÉNÉRATION DE COMMANDES CURL");
  console.log("===============================");

  const csvContent = fs.readFileSync("css-colors-import.csv", "utf8");
  const lines = csvContent.split("\n").slice(1, 11); // 10 premières couleurs

  console.log("📝 Copiez ces commandes dans votre terminal:");
  console.log("");

  lines.forEach((line, index) => {
    if (line.trim()) {
      const [name, hex, code] = line.split(",");
      console.log(`# ${index + 1}. Couleur: ${name}`);
      console.log(
        `curl -X POST "https://f6d72e-0f.myshopify.com/admin/api/2023-10/metaobjects.json" \\`
      );
      console.log(`  -H "Content-Type: application/json" \\`);
      console.log(`  -H "X-Shopify-Access-Token: VOTRE_TOKEN" \\`);
      console.log(`  -d '{`);
      console.log(`    "metaobject": {`);
      console.log(`      "type": "colors",`);
      console.log(`      "fields": {`);
      console.log(`        "display_name": "${name}",`);
      console.log(`        "hex_value": "${hex}",`);
      console.log(`        "css_name": "${code}"`);
      console.log(`      }`);
      console.log(`    }`);
      console.log(`  }'`);
      console.log("");
    }
  });

  console.log(
    "⚠️ IMPORTANT: Remplacez VOTRE_TOKEN par votre access token Shopify"
  );
  console.log(
    "💡 Comment obtenir un token: https://help.shopify.com/en/manual/apps/app-types/private-apps"
  );
}

// Méthode principale
async function main() {
  console.log("🌈 IMPORT COULEURS VIA API SHOPIFY");
  console.log("==================================");

  // Vérifier le fichier CSV
  if (!fs.existsSync("css-colors-import.csv")) {
    console.error("❌ Fichier css-colors-import.csv non trouvé");
    process.exit(1);
  }

  // Pour l'instant, générons les commandes cURL
  generateCurlCommands();

  console.log("");
  console.log("🎯 ALTERNATIVES PLUS SIMPLES:");
  console.log("=============================");
  console.log("1. 📱 Apps Shopify: Installez Matrixify ou Ablestar");
  console.log("2. 🖱️ Création manuelle: 5-10 couleurs principales seulement");
  console.log("3. 🔧 Shopify Scripts (si Shopify Plus)");
  console.log("");
  console.log(
    "💡 RECOMMANDATION: Créez manuellement ces couleurs essentielles:"
  );
  console.log("   Red, Blue, Green, Yellow, Black, White, Orange, Purple");
}

if (require.main === module) {
  main().catch(console.error);
}
