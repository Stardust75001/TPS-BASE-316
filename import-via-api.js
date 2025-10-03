#!/usr/bin/env node

/**
 * IMPORT COMPLET VIA API SHOPIFY
 * Import toutes les 147 couleurs via l'API REST de Shopify
 */

const fs = require("fs");
const https = require("https");
const { parse } = require("csv-parse");

// Configuration API Shopify
const API_CONFIG = {
  shop: "f6d72e-0f",
  // Le token sera demandé interactivement
  accessToken: null,
  apiVersion: "2023-10",
};

// Fonction pour créer un metaobject via API
function createMetaobject(color, accessToken) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
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

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const response = JSON.parse(data);

          if (res.statusCode === 201 && response.metaobject) {
            resolve({
              success: true,
              id: response.metaobject.id,
              handle: response.metaobject.handle,
            });
          } else {
            resolve({
              success: false,
              error: response.errors || `HTTP ${res.statusCode}`,
              response: data,
            });
          }
        } catch (error) {
          reject({
            success: false,
            error: `Parse error: ${error.message}`,
            response: data,
          });
        }
      });
    });

    req.on("error", (error) => {
      reject({
        success: false,
        error: `Request error: ${error.message}`,
      });
    });

    req.write(postData);
    req.end();
  });
}

// Fonction pour tester la connexion API
function testAPIConnection(accessToken) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: `${API_CONFIG.shop}.myshopify.com`,
      port: 443,
      path: `/admin/api/${API_CONFIG.apiVersion}/shop.json`,
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": accessToken,
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode === 200) {
          const shop = JSON.parse(data).shop;
          resolve({
            success: true,
            shopName: shop.name,
            domain: shop.domain,
          });
        } else {
          reject({
            success: false,
            error: `HTTP ${res.statusCode}: ${data}`,
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

    req.end();
  });
}

// Lecture interactive du token
function promptForToken() {
  const readline = require("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    console.log("\n🔐 CONFIGURATION API SHOPIFY");
    console.log("============================");
    console.log(
      "1. Créez une app privée: https://admin.shopify.com/store/f6d72e-0f/settings/apps"
    );
    console.log("2. Permissions: write_products, read_products");
    console.log('3. Copiez votre "Admin API access token"');
    console.log("");

    rl.question("📝 Collez votre Access Token: ", (token) => {
      rl.close();
      resolve(token.trim());
    });
  });
}

// Import principal
async function importAllColorsViaAPI() {
  try {
    console.log("🌈 IMPORT COMPLET VIA API SHOPIFY");
    console.log("=================================");

    // Demander le token
    const accessToken = await promptForToken();

    if (!accessToken) {
      console.error("❌ Token requis pour continuer");
      process.exit(1);
    }

    // Tester la connexion
    console.log("\n🔍 Test de connexion API...");
    try {
      const connection = await testAPIConnection(accessToken);
      console.log(
        `✅ Connecté à: ${connection.shopName} (${connection.domain})`
      );
    } catch (error) {
      console.error("❌ Erreur de connexion API:", error.error);
      console.log("💡 Vérifiez votre token et les permissions");
      process.exit(1);
    }

    // Lire le CSV
    console.log("\n📊 Lecture du CSV...");
    const colors = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream("css-colors-import.csv")
        .pipe(parse({ columns: true, skip_empty_lines: true }))
        .on("data", (row) => {
          if (row.Name && row.Hex && row.Code) {
            colors.push({
              name: row.Name.trim(),
              hex: row.Hex.trim(),
              code: row.Code.trim(),
            });
          }
        })
        .on("end", async () => {
          console.log(`✅ ${colors.length} couleurs à importer`);

          // Import des couleurs
          let successCount = 0;
          let errorCount = 0;
          const errors = [];

          console.log("\n🚀 Début de l'import...");

          for (let i = 0; i < colors.length; i++) {
            const color = colors[i];
            const progress = `[${i + 1}/${colors.length}]`;

            process.stdout.write(`📤 ${progress} ${color.name}... `);

            try {
              const result = await createMetaobject(color, accessToken);

              if (result.success) {
                console.log(`✅ OK (ID: ${result.id})`);
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

            // Délai pour respecter les limites API
            if (i < colors.length - 1) {
              await new Promise((resolve) => setTimeout(resolve, 500));
            }
          }

          // Rapport final
          console.log("\n" + "=".repeat(50));
          console.log("📊 RÉSULTATS FINAUX");
          console.log("=".repeat(50));
          console.log(`✅ Succès: ${successCount}/${colors.length} couleurs`);
          console.log(`❌ Erreurs: ${errorCount}/${colors.length} couleurs`);

          if (errors.length > 0 && errors.length <= 10) {
            console.log("\n🔍 Détail des erreurs:");
            errors.forEach((error) => {
              console.log(`  - ${error.color}: ${error.error}`);
            });
          }

          if (successCount > 0) {
            console.log("\n🎉 IMPORT RÉUSSI !");
            console.log(
              "🔗 Vérifiez: Admin > Content > Metaobjects > CSS Colors"
            );
            console.log("\n🧪 COMMANDE DE TEST:");
            console.log(
              "shopify theme push --only=snippets/color-system-test.liquid"
            );
          }

          resolve(successCount > 0);
        })
        .on("error", (error) => {
          console.error("❌ Erreur lecture CSV:", error);
          reject(error);
        });
    });
  } catch (error) {
    console.error("💥 Erreur fatale:", error);
    process.exit(1);
  }
}

// Fonction de génération de commandes cURL (backup)
function generateCurlCommands(accessToken = "YOUR_ACCESS_TOKEN") {
  console.log("📋 COMMANDES CURL (BACKUP)");
  console.log("==========================");

  const csvContent = fs.readFileSync("css-colors-import.csv", "utf8");
  const lines = csvContent.split("\n").slice(1, 6); // 5 premières couleurs

  lines.forEach((line, index) => {
    if (line.trim()) {
      const [name, hex, code] = line.split(",");
      console.log(`\n# ${index + 1}. ${name}`);
      console.log(
        `curl -X POST "https://${API_CONFIG.shop}.myshopify.com/admin/api/${API_CONFIG.apiVersion}/metaobjects.json" \\`
      );
      console.log(`  -H "Content-Type: application/json" \\`);
      console.log(`  -H "X-Shopify-Access-Token: ${accessToken}" \\`);
      console.log(
        `  -d '{"metaobject":{"type":"colors","fields":{"display_name":"${name}","hex_value":"${hex}","css_name":"${code}"}}}'`
      );
    }
  });
}

// Menu principal
async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--curl")) {
    generateCurlCommands();
  } else {
    await importAllColorsViaAPI();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { importAllColorsViaAPI, generateCurlCommands };
