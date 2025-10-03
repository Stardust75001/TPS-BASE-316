#!/usr/bin/env node

/**
 * IMPORT FINAL QUI FONCTIONNE
 * API 2025-01, définition créée, test prouvé fonctionnel
 */

const https = require("https");
const fs = require("fs");

const API_CONFIG = {
  shop: "f6d72e-0f",
  accessToken: "shpat_REDACTED",
  apiVersion: "2025-01", // CORRECT !
};

// Lire couleurs CSV
function readColors() {
  const csvContent = fs.readFileSync("css-colors-import.csv", "utf8");
  const lines = csvContent.split("\n").slice(1);
  const colors = [];

  lines.forEach((line) => {
    if (line.trim()) {
      const [name, hex, code] = line.split(",");
      if (name && hex && code) {
        colors.push({
          name: name.trim(),
          hex: hex.trim(),
          code: code.trim(),
        });
      }
    }
  });

  return colors;
}

// Créer couleur - EXACTEMENT comme curl qui fonctionne
function createColor(color) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      metaobject: {
        type: "colors",
        fields: [
          { key: "display_name", value: color.name },
          { key: "hex_value", value: color.hex },
          { key: "css_name", value: color.code },
        ],
      },
    });

    const options = {
      hostname: "f6d72e-0f.myshopify.com",
      port: 443,
      path: "/admin/api/2025-01/metaobjects.json",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": "shpat_REDACTED",
        "Content-Length": postData.length,
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode === 201) {
          resolve({ success: true });
        } else {
          resolve({
            success: false,
            status: res.statusCode,
            error: data,
          });
        }
      });
    });

    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

// Import final
async function importAll() {
  console.log("🚀 IMPORT FINAL - VERSION QUI FONCTIONNE");
  console.log("========================================");

  const colors = readColors();
  console.log(`📊 ${colors.length} couleurs à importer`);

  let success = 0;
  let errors = 0;
  const startTime = Date.now();

  for (let i = 0; i < colors.length; i++) {
    const color = colors[i];
    const progress = `[${i + 1}/${colors.length}]`;

    process.stdout.write(`📤 ${progress} ${color.name}... `);

    try {
      const result = await createColor(color);

      if (result.success) {
        console.log("✅");
        success++;
      } else {
        console.log(`❌ ${result.status}`);
        errors++;

        // Si trop d'erreurs, arrêter
        if (errors > 5) {
          console.log("\n❌ Trop d'erreurs, arrêt");
          break;
        }
      }
    } catch (error) {
      console.log(`❌ ${error.message}`);
      errors++;
    }

    // Délai respectueux
    if (i < colors.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  }

  const duration = Math.round((Date.now() - startTime) / 1000);
  console.log("\n" + "=".repeat(50));
  console.log("📊 RÉSULTATS FINAUX");
  console.log("=".repeat(50));
  console.log(`✅ Succès: ${success}/${colors.length}`);
  console.log(`❌ Erreurs: ${errors}/${colors.length}`);
  console.log(`⏱️  Durée: ${duration}s`);

  if (success > 0) {
    console.log("\n🎉 IMPORT RÉUSSI !");
    console.log(
      "🔗 Admin: https://admin.shopify.com/store/f6d72e-0f/content/metaobjects"
    );
  }
}

importAll().catch(console.error);
