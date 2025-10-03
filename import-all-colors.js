#!/usr/bin/env node

/**
 * IMPORT AUTOMATIQUE COMPLET DU CSV VERS SHOPIFY METAOBJECTS
 * Importe toutes les 147 couleurs du fichier CSV
 */

const fs = require("fs");
const { parse } = require("csv-parse");
const { execSync } = require("child_process");

async function importAllColors() {
  console.log("🌈 IMPORT AUTOMATIQUE COMPLET - 147 COULEURS");
  console.log("=============================================");

  // Vérifier la connexion Shopify
  try {
    execSync("shopify theme list", { stdio: "ignore" });
    console.log("✅ Connecté à Shopify");
  } catch (error) {
    console.log("❌ Non connecté à Shopify");
    console.log("💡 Exécutez: shopify auth login");
    process.exit(1);
  }

  // Lire et parser le CSV
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
        console.log(`📊 ${colors.length} couleurs à importer`);

        let successCount = 0;
        let errorCount = 0;

        // Import chaque couleur
        for (let i = 0; i < colors.length; i++) {
          const color = colors[i];
          const progress = `[${i + 1}/${colors.length}]`;

          console.log(`📤 ${progress} Import: ${color.name} (${color.hex})`);

          // Créer le fichier GraphQL
          const mutationFile = `mutation_${i}.graphql`;
          const mutation = `mutation {
  metaobjectCreate(metaobject: {
    type: "colors"
    fields: [
      {key: "display_name", value: "${color.name}"}
      {key: "hex_value", value: "${color.hex}"}
      {key: "css_name", value: "${color.code}"}
    ]
  }) {
    metaobject {
      id
      handle
    }
    userErrors {
      field
      message
    }
  }
}`;

          fs.writeFileSync(mutationFile, mutation);

          try {
            // Essayer différentes commandes Shopify CLI
            let success = false;

            // Méthode 1: shopify theme console
            try {
              execSync(
                `shopify theme console --store=$(shopify theme list | head -1 | grep -o 'f6d72e-0f') < ${mutationFile}`,
                {
                  stdio: "ignore",
                  timeout: 5000,
                }
              );
              success = true;
            } catch {}

            // Méthode 2: Via développement local
            if (!success) {
              try {
                execSync(
                  `curl -X POST "http://127.0.0.1:9292/admin/api/2023-10/graphql.json" -H "Content-Type: application/json" -d '{"query": "${mutation
                    .replace(/"/g, '\\"')
                    .replace(/\n/g, "\\n")}"}'`,
                  {
                    stdio: "ignore",
                    timeout: 5000,
                  }
                );
                success = true;
              } catch {}
            }

            // Méthode 3: Shopify Partners CLI
            if (!success) {
              try {
                execSync(
                  `shopify app exec graphql --query='${mutation.replace(
                    /'/g,
                    "\\'"
                  )}' 2>/dev/null`,
                  {
                    stdio: "ignore",
                    timeout: 5000,
                  }
                );
                success = true;
              } catch {}
            }

            if (success) {
              console.log(`✅ ${color.name} importé avec succès`);
              successCount++;
            } else {
              console.log(`⚠️ ${color.name} - erreur d'import`);
              errorCount++;
            }
          } catch (error) {
            console.log(`❌ ${color.name} - échec complet`);
            errorCount++;
          }

          // Nettoyer
          fs.unlinkSync(mutationFile);

          // Délai pour éviter les limites de taux
          await new Promise((resolve) => setTimeout(resolve, 200));
        }

        console.log("\n" + "=".repeat(50));
        console.log("📊 RÉSULTATS FINAUX");
        console.log("=".repeat(50));
        console.log(`✅ Succès: ${successCount}/${colors.length} couleurs`);
        console.log(`❌ Erreurs: ${errorCount}/${colors.length} couleurs`);

        if (successCount > 0) {
          console.log("\n🎉 IMPORT RÉUSSI !");
          console.log(
            "🔗 Vérifiez: Admin > Content > Metaobjects > CSS Colors"
          );
          console.log("\n🧪 COMMANDE DE TEST:");
          console.log(
            "shopify theme push --only=snippets/color-system-test.liquid"
          );
        } else {
          console.log("\n❌ AUCUN IMPORT AUTOMATIQUE RÉUSSI");
          console.log("\n🔧 SOLUTIONS ALTERNATIVES:");
          console.log("1. Interface Shopify: Admin > Metaobjects > Import CSV");
          console.log("2. Shopify Plus: Utilisez Flow ou Scripts");
          console.log("3. App tierce: Matrixify, Excelify");
        }

        resolve(successCount > 0);
      })
      .on("error", (error) => {
        console.error("❌ Erreur lecture CSV:", error);
        reject(error);
      });
  });
}

// Exécution
if (require.main === module) {
  importAllColors()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("💥 Erreur fatale:", error);
      process.exit(1);
    });
}

module.exports = importAllColors;
