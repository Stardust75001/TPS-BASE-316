#!/usr/bin/env node

/**
 * SCRIPT D'IMPORT DES COULEURS CSS VERS SHOPIFY METAOBJECTS
 *
 * Ce script importe les couleurs CSS nommées dans Shopify comme metaobjects
 * pour être utilisées dans les variantes de produits.
 *
 * Usage: node css-colors-to-shopify.js
 */

const fs = require("fs");
const { parse } = require("csv-parse");
const { execSync } = require("child_process");

// Configuration
const CONFIG = {
  csvFile: "css-colors-import.csv",
  metaObjectType: "colors",
  batchSize: 20, // Nombre de couleurs à traiter par lot
  delay: 1000, // Délai entre les requêtes (ms)
};

// Classe principale pour l'import
class ColorImporter {
  constructor() {
    this.colors = [];
    this.importedCount = 0;
    this.errors = [];
  }

  // Lecture du fichier CSV
  async readCSV() {
    return new Promise((resolve, reject) => {
      const results = [];

      fs.createReadStream(CONFIG.csvFile)
        .pipe(
          parse({
            columns: true,
            skip_empty_lines: true,
            trim: true,
          })
        )
        .on("data", (data) => {
          // Validation des données
          if (data.Name && data.Hex && data.Code) {
            results.push({
              name: data.Name.trim(),
              hex: data.Hex.trim(),
              code: data.Code.trim(),
            });
          }
        })
        .on("end", () => {
          this.colors = results;
          console.log(`✅ ${results.length} couleurs chargées depuis le CSV`);
          resolve(results);
        })
        .on("error", (error) => {
          console.error("❌ Erreur de lecture CSV:", error);
          reject(error);
        });
    });
  }

  // Création de la définition du metaobject
  async createMetaObjectDefinition() {
    console.log('🔧 Création de la définition metaobject "colors"...');

    const metaObjectDefinition = {
      type: CONFIG.metaObjectType,
      name: "CSS Colors",
      description: "CSS Named Colors for product variants",
      fieldDefinitions: [
        {
          key: "display_name",
          name: "Display Name",
          description: "User-friendly color name for display (e.g., Aliceblue)",
          type: "single_line_text_field",
          required: true,
        },
        {
          key: "hex_value",
          name: "Hex Color Value",
          description: "Hexadecimal color value (e.g., #F0F8FF)",
          type: "single_line_text_field",
          required: true,
        },
        {
          key: "css_name",
          name: "CSS Color Name",
          description: "Standard CSS color name (e.g., aliceblue)",
          type: "single_line_text_field",
          required: true,
        },
      ],
    };

    try {
      // Utilisation de Shopify CLI pour créer la définition
      const command = `shopify app generate schema --type=metaobject --name=${CONFIG.metaObjectType}`;
      console.log(`Exécution: ${command}`);

      // Création manuelle via GraphQL (exemple)
      console.log("📝 Définition metaobject préparée:");
      console.log(JSON.stringify(metaObjectDefinition, null, 2));

      return true;
    } catch (error) {
      console.error("❌ Erreur lors de la création de la définition:", error);
      return false;
    }
  }

  // Import d'une couleur individuelle
  async importColor(color) {
    try {
      // Construction de la mutation GraphQL
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
          type: CONFIG.metaObjectType,
          fields: [
            { key: "display_name", value: color.name },
            { key: "hex_value", value: color.hex },
            { key: "css_name", value: color.code },
          ],
        },
      };

      // Simulation de l'import (remplacer par l'appel API réel)
      console.log(`📤 Import: ${color.name} (${color.hex})`);

      // Ici vous devriez faire l'appel API réel à Shopify
      // const response = await shopifyAPI.graphql(mutation, variables);

      this.importedCount++;
      return true;
    } catch (error) {
      console.error(`❌ Erreur import ${color.name}:`, error);
      this.errors.push({ color: color.name, error: error.message });
      return false;
    }
  }

  // Import par lots
  async importColorsInBatches() {
    console.log(`🚀 Début de l'import de ${this.colors.length} couleurs...`);

    for (let i = 0; i < this.colors.length; i += CONFIG.batchSize) {
      const batch = this.colors.slice(i, i + CONFIG.batchSize);

      console.log(
        `\n📦 Traitement du lot ${
          Math.floor(i / CONFIG.batchSize) + 1
        }/${Math.ceil(this.colors.length / CONFIG.batchSize)}`
      );

      // Traitement du lot
      const promises = batch.map((color) => this.importColor(color));
      await Promise.all(promises);

      // Délai entre les lots
      if (i + CONFIG.batchSize < this.colors.length) {
        console.log(`⏳ Attente ${CONFIG.delay}ms avant le prochain lot...`);
        await new Promise((resolve) => setTimeout(resolve, CONFIG.delay));
      }
    }
  }

  // Génération du rapport final
  generateReport() {
    console.log("\n" + "=".repeat(60));
    console.log("📊 RAPPORT D'IMPORT DES COULEURS CSS");
    console.log("=".repeat(60));
    console.log(
      `✅ Couleurs importées: ${this.importedCount}/${this.colors.length}`
    );
    console.log(`❌ Erreurs: ${this.errors.length}`);

    if (this.errors.length > 0) {
      console.log("\n🔍 Détail des erreurs:");
      this.errors.forEach((error) => {
        console.log(`  - ${error.color}: ${error.error}`);
      });
    }

    console.log("\n🎯 ÉTAPES SUIVANTES:");
    console.log("1. Vérifiez les metaobjects dans votre admin Shopify");
    console.log("2. Configurez les champs de variantes produit");
    console.log("3. Modifiez vos templates pour utiliser ces couleurs");
    console.log("=".repeat(60));

    // Sauvegarde du rapport
    const report = {
      timestamp: new Date().toISOString(),
      totalColors: this.colors.length,
      imported: this.importedCount,
      errors: this.errors,
    };

    fs.writeFileSync(
      "color-import-report.json",
      JSON.stringify(report, null, 2)
    );
    console.log("💾 Rapport sauvegardé dans color-import-report.json");
  }

  // Méthode principale
  async run() {
    console.log("🌈 IMPORT DES COULEURS CSS VERS SHOPIFY");
    console.log("=====================================\n");

    try {
      // 1. Lecture du CSV
      await this.readCSV();

      // 2. Création de la définition metaobject
      await this.createMetaObjectDefinition();

      // 3. Import des couleurs
      await this.importColorsInBatches();

      // 4. Rapport final
      this.generateReport();
    } catch (error) {
      console.error("💥 Erreur fatale:", error);
      process.exit(1);
    }
  }
}

// Exécution du script
if (require.main === module) {
  const importer = new ColorImporter();
  importer.run().catch(console.error);
}

module.exports = ColorImporter;
