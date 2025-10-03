#!/usr/bin/env node

/**
 * IMPORT INTELLIGENT - Évite les duplicatas
 * Vérifie les metaobjects existants avant d'importer
 */

const https = require("https");
const fs = require("fs");

const API_CONFIG = {
  shop: "f6d72e-0f",
  accessToken: "shpat_REDACTED",
  apiVersion: "2025-01",
};

// Lire le CSV local
function readCSVColors() {
  try {
    const csvContent = fs.readFileSync("css-colors-import.csv", "utf8");
    const lines = csvContent.split("\n").slice(1); // Skip header
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

    console.log(`📊 ${colors.length} couleurs trouvées dans le CSV`);
    return colors;
  } catch (error) {
    console.error("❌ Erreur lecture CSV:", error.message);
    return [];
  }
}

// Récupérer les metaobjects existants
function getExistingMetaobjects() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: `${API_CONFIG.shop}.myshopify.com`,
      port: 443,
      path: `/admin/api/${API_CONFIG.apiVersion}/metaobjects.json?limit=250`,
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": API_CONFIG.accessToken,
      },
    };

    console.log("🔍 Récupération des metaobjects existants...");

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          const allMetaobjects = response.metaobjects || [];

          // Filtrer seulement les metaobjects de type "colors"
          const existing = allMetaobjects.filter(
            (obj) => obj.type === "colors"
          );
          console.log(`📋 ${existing.length} metaobjects colors existants`);

          // Extraire les noms CSS existants
          const existingCSSNames = existing
            .map((obj) => {
              const cssNameField = obj.fields?.find(
                (f) => f.key === "css_name"
              );
              return cssNameField ? cssNameField.value : null;
            })
            .filter(Boolean);

          console.log(
            "🏷️  CSS names existants:",
            existingCSSNames.slice(0, 10),
            "..."
          );
          resolve(existingCSSNames);
        } else if (res.statusCode === 404) {
          // Aucun metaobject n'existe encore
          console.log("📋 0 metaobjects existants (première fois)");
          resolve([]);
        } else {
          console.error("❌ Erreur récupération:", data);
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });

    req.on("error", reject);
    req.end();
  });
}

// Créer un metaobject
function createMetaobject(color, accessToken) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      metaobject: {
        type: "colors",
        fields: [
          {
            key: "display_name",
            value: color.name,
          },
          {
            key: "hex_value",
            value: color.hex,
          },
          {
            key: "css_name",
            value: color.code,
          },
        ],
      },
    });

    const options = {
      hostname: `${API_CONFIG.shop}.myshopify.com`,
      port: 443,
      path: `/admin/api/${API_CONFIG.apiVersion}/metaobjects.json`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
        "X-Shopify-Access-Token": accessToken,
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode === 201) {
          const response = JSON.parse(data);
          resolve({
            success: true,
            id: response.metaobject.id,
            handle: response.metaobject.handle,
          });
        } else {
          resolve({
            success: false,
            error: `HTTP ${res.statusCode}`,
            response: data,
          });
        }
      });
    });

    req.on("error", (error) => {
      reject({
        success: false,
        error: error.message,
      });
    });

    req.write(postData);
    req.end();
  });
}

// Import intelligent
async function smartImport() {
  try {
    console.log("🧠 IMPORT INTELLIGENT - CSS COLORS");
    console.log("===================================");

    // 1. Lire le CSV
    const csvColors = readCSVColors();
    if (csvColors.length === 0) {
      console.error("❌ Aucune couleur dans le CSV");
      return;
    }

    // 2. Récupérer les existants
    const existingCSSNames = await getExistingMetaobjects();

    // 3. Filtrer les nouveaux
    const newColors = csvColors.filter(
      (color) => !existingCSSNames.includes(color.code)
    );

    console.log("\n📊 ANALYSE:");
    console.log(`📄 CSV: ${csvColors.length} couleurs`);
    console.log(`🗄️  Existants: ${existingCSSNames.length} metaobjects`);
    console.log(`✨ Nouveaux: ${newColors.length} à importer`);

    if (newColors.length === 0) {
      console.log("🎉 Toutes les couleurs sont déjà importées !");
      return;
    }

    // 4. Importer les nouveaux
    console.log("\n🚀 Import des nouveaux...");
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < newColors.length; i++) {
      const color = newColors[i];
      const progress = `[${i + 1}/${newColors.length}]`;

      process.stdout.write(`📤 ${progress} ${color.name} (${color.code})... `);

      try {
        const result = await createMetaobject(color, API_CONFIG.accessToken);

        if (result.success) {
          console.log(`✅ OK`);
          successCount++;
        } else {
          console.log(`❌ ERREUR: ${result.error}`);
          errorCount++;
          errors.push({
            color: color.name,
            error: result.error,
          });
        }
      } catch (error) {
        console.log(`❌ EXCEPTION: ${error.error}`);
        errorCount++;
        errors.push({
          color: color.name,
          error: error.error,
        });
      }

      // Délai respectueux (1 req/sec)
      if (i < newColors.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1100));
      }
    }

    // 5. Rapport final
    console.log("\n" + "=".repeat(60));
    console.log("📊 RÉSULTATS FINAUX");
    console.log("=".repeat(60));
    console.log(`✅ Succès: ${successCount}/${newColors.length} nouveaux`);
    console.log(`❌ Erreurs: ${errorCount}/${newColors.length}`);
    console.log(
      `🏆 Total système: ${existingCSSNames.length + successCount} couleurs`
    );

    if (errors.length > 0 && errors.length <= 3) {
      console.log("\n🔍 Erreurs détaillées:");
      errors.forEach((error) => {
        console.log(`  - ${error.color}: ${error.error}`);
      });
    }

    if (successCount > 0) {
      console.log("\n🎉 IMPORT RÉUSSI !");
      console.log(
        "🔗 Admin: https://admin.shopify.com/store/f6d72e-0f/content/metaobjects"
      );
    }

    if (successCount + existingCSSNames.length >= 140) {
      console.log("\n🌈 SYSTÈME COMPLET !");
      console.log("🛍️  Prêt pour les templates produits");
    }
  } catch (error) {
    console.error("💥 Erreur fatale:", error);
  }
}

// Lancement
if (require.main === module) {
  smartImport().catch(console.error);
}

module.exports = { smartImport };
