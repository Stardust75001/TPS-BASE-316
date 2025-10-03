#!/usr/bin/env node

/**
 * SCRIPT D'IMPORT DIRECT VIA SHOPIFY CLI
 *
 * Import les couleurs CSS directement dans les metaobjects Shopify
 * via l'API GraphQL Admin
 */

const fs = require("fs");
const { parse } = require("csv-parse");
const { execSync } = require("child_process");

async function importColorsToShopify() {
  console.log("🌈 IMPORT DIRECT DES COULEURS VERS SHOPIFY METAOBJECTS");
  console.log("====================================================");

  // Lecture du CSV
  const colors = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream("css-colors-import.csv")
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on("data", (row) => {
        if (row.Name && row.Hex && row.Code) {
          colors.push({
            display_name: row.Name.trim(),
            hex_value: row.Hex.trim(),
            css_name: row.Code.trim(),
          });
        }
      })
      .on("end", async () => {
        console.log(`📊 ${colors.length} couleurs à importer`);

        // Import via Shopify CLI GraphQL
        for (let i = 0; i < colors.length; i++) {
          const color = colors[i];
          console.log(
            `📤 Import ${i + 1}/${colors.length}: ${color.display_name}`
          );

          // Créer la mutation GraphQL
          const mutation = `
                        mutation metaobjectCreate($metaobject: MetaobjectCreateInput!) {
                            metaobjectCreate(metaobject: $metaobject) {
                                metaobject {
                                    id
                                    handle
                                }
                                userErrors {
                                    field
                                    message
                                }
                            }
                        }
                    `;

          const variables = {
            metaobject: {
              type: "colors",
              fields: [
                { key: "display_name", value: color.display_name },
                { key: "hex_value", value: color.hex_value },
                { key: "css_name", value: color.css_name },
              ],
            },
          };

          // Écrire la requête dans un fichier temporaire
          const queryFile = `temp_query_${i}.json`;
          fs.writeFileSync(
            queryFile,
            JSON.stringify({ query: mutation, variables })
          );

          try {
            // Exécuter via Shopify CLI
            const result = execSync(
              `shopify app exec graphql-query --file=${queryFile}`,
              {
                encoding: "utf8",
                timeout: 10000,
              }
            );

            console.log(`✅ ${color.display_name} importé`);

            // Nettoyer le fichier temporaire
            fs.unlinkSync(queryFile);

            // Délai pour éviter les limites de taux
            if (i < colors.length - 1) {
              await new Promise((resolve) => setTimeout(resolve, 500));
            }
          } catch (error) {
            console.error(
              `❌ Erreur pour ${color.display_name}:`,
              error.message
            );
            fs.unlinkSync(queryFile);
          }
        }

        console.log("\n✅ Import terminé!");
        resolve();
      })
      .on("error", reject);
  });
}

if (require.main === module) {
  importColorsToShopify().catch(console.error);
}
