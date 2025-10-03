#!/usr/bin/env node

/**
 * SCRIPT DE CONFIGURATION METAOBJECT COLORS
 *
 * Ce script crée la définition metaobject "colors" dans Shopify
 * pour stocker les informations des couleurs CSS.
 */

const { execSync } = require("child_process");
const fs = require("fs");

// Configuration de la définition metaobject
const METAOBJECT_DEFINITION = {
  type: "colors",
  name: "CSS Colors",
  description: "CSS Named Colors for product color variants and swatches",
  access: {
    admin: "MERCHANT_READ_WRITE",
    storefront: "PUBLIC_READ",
  },
  capabilities: {
    publishable: {
      enabled: true,
    },
  },
  fieldDefinitions: [
    {
      key: "display_name",
      name: "Display Name",
      description: "User-friendly color name for display",
      type: {
        name: "single_line_text_field",
      },
      required: true,
      validations: [
        {
          name: "min",
          value: "1",
        },
        {
          name: "max",
          value: "50",
        },
      ],
    },
    {
      key: "hex_value",
      name: "Hex Color Value",
      description: "Hexadecimal color value (e.g., #F0F8FF)",
      type: {
        name: "single_line_text_field",
      },
      required: true,
      validations: [
        {
          name: "regex",
          value: "^#[0-9A-Fa-f]{6}$",
        },
      ],
    },
    {
      key: "css_name",
      name: "CSS Color Name",
      description: "Standard CSS color name (e.g., aliceblue)",
      type: {
        name: "single_line_text_field",
      },
      required: true,
      validations: [
        {
          name: "min",
          value: "1",
        },
        {
          name: "max",
          value: "30",
        },
      ],
    },
    {
      key: "color_family",
      name: "Color Family",
      description: "Color family category (e.g., Blue, Red, Green)",
      type: {
        name: "single_line_text_field",
      },
      required: false,
    },
    {
      key: "brightness",
      name: "Brightness Level",
      description: "Light, Medium, or Dark",
      type: {
        name: "single_line_text_field",
      },
      required: false,
      validations: [
        {
          name: "choices",
          value: ["Light", "Medium", "Dark"],
        },
      ],
    },
    {
      key: "is_active",
      name: "Is Active",
      description: "Whether this color is available for selection",
      type: {
        name: "boolean",
      },
      required: false,
    },
  ],
};

class MetaObjectConfigurator {
  constructor() {
    this.definitionFile = "metaobject-colors-definition.json";
  }

  // Sauvegarde de la définition
  saveDefinition() {
    console.log("💾 Sauvegarde de la définition metaobject...");

    fs.writeFileSync(
      this.definitionFile,
      JSON.stringify(METAOBJECT_DEFINITION, null, 2)
    );

    console.log(`✅ Définition sauvegardée dans ${this.definitionFile}`);
  }

  // Affichage des instructions
  showInstructions() {
    console.log("\n" + "=".repeat(70));
    console.log('📋 INSTRUCTIONS POUR CRÉER LE METAOBJECT "COLORS"');
    console.log("=".repeat(70));

    console.log("\n🖥️  MÉTHODE 1: Via l'Admin Shopify (Recommandée)");
    console.log("1. Allez dans Settings > Custom Data > Metaobjects");
    console.log('2. Cliquez sur "Add definition"');
    console.log("3. Utilisez ces paramètres:");
    console.log("   - Type: colors");
    console.log("   - Name: CSS Colors");
    console.log(
      "   - Description: CSS Named Colors for product color variants"
    );

    console.log("\n4. Ajoutez ces champs:");
    METAOBJECT_DEFINITION.fieldDefinitions.forEach((field, index) => {
      console.log(`   ${index + 1}. ${field.name} (${field.key})`);
      console.log(`      - Type: ${field.type.name}`);
      console.log(`      - Required: ${field.required ? "Oui" : "Non"}`);
      console.log(`      - Description: ${field.description}`);
      if (field.validations) {
        console.log(
          `      - Validations: ${JSON.stringify(field.validations)}`
        );
      }
      console.log("");
    });

    console.log("\n🛠️  MÉTHODE 2: Via Shopify CLI/API (Avancée)");
    console.log("1. Utilisez le fichier de définition généré");
    console.log("2. Implémentez via GraphQL Admin API");
    console.log("3. Ou utilisez Shopify CLI avec les apps");

    console.log("\n🎯 APRÈS CRÉATION:");
    console.log("1. Exécutez: node css-colors-to-shopify.js");
    console.log("2. Vérifiez les données dans l'admin");
    console.log("3. Configurez vos templates de produit");

    console.log("\n" + "=".repeat(70));
  }

  // Génération du script d'import simplifié
  generateImportScript() {
    const importScript = `#!/usr/bin/env node

/**
 * SCRIPT D'IMPORT SIMPLIFIÉ DES COULEURS
 * Utilise Shopify CLI pour importer les couleurs une par une
 */

const fs = require('fs');
const { execSync } = require('child_process');
const { parse } = require('csv-parse');

async function importColors() {
    console.log('🌈 Import des couleurs CSS...');

    const colors = [];

    // Lecture du CSV
    fs.createReadStream('css-colors-import.csv')
        .pipe(parse({ columns: true, skip_empty_lines: true }))
        .on('data', (row) => {
            colors.push({
                displayName: row.Name,
                hexValue: row.Hex,
                cssName: row.Code,
                colorFamily: getColorFamily(row.Name),
                brightness: getBrightness(row.Name),
                isActive: true
            });
        })
        .on('end', () => {
            console.log(\`✅ \${colors.length} couleurs à importer\`);

            // Import via Shopify CLI (exemple)
            colors.forEach((color, index) => {
                console.log(\`📤 Import \${index + 1}/\${colors.length}: \${color.displayName}\`);

                // Ici, vous devriez utiliser l'API Shopify ou CLI
                // Exemple de structure de données pour metaobject:
                console.log(JSON.stringify({
                    type: 'colors',
                    fields: {
                        display_name: color.displayName,
                        hex_value: color.hexValue,
                        css_name: color.cssName,
                        color_family: color.colorFamily,
                        brightness: color.brightness,
                        is_active: color.isActive
                    }
                }, null, 2));
            });
        });
}

function getColorFamily(colorName) {
    const name = colorName.toLowerCase();
    if (name.includes('blue')) return 'Blue';
    if (name.includes('red')) return 'Red';
    if (name.includes('green')) return 'Green';
    if (name.includes('yellow')) return 'Yellow';
    if (name.includes('purple') || name.includes('violet')) return 'Purple';
    if (name.includes('orange')) return 'Orange';
    if (name.includes('pink')) return 'Pink';
    if (name.includes('brown')) return 'Brown';
    if (name.includes('gray') || name.includes('grey')) return 'Gray';
    if (name.includes('black')) return 'Black';
    if (name.includes('white')) return 'White';
    return 'Other';
}

function getBrightness(colorName) {
    const name = colorName.toLowerCase();
    if (name.includes('light') || name.includes('pale')) return 'Light';
    if (name.includes('dark')) return 'Dark';
    return 'Medium';
}

importColors().catch(console.error);
`;

    fs.writeFileSync("import-colors-simple.js", importScript);
    console.log("✅ Script d'import simplifié créé: import-colors-simple.js");
  }

  // Méthode principale
  run() {
    console.log("🎨 CONFIGURATION METAOBJECT COLORS POUR SHOPIFY");
    console.log("===============================================\n");

    this.saveDefinition();
    this.generateImportScript();
    this.showInstructions();
  }
}

// Exécution
if (require.main === module) {
  const configurator = new MetaObjectConfigurator();
  configurator.run();
}

module.exports = MetaObjectConfigurator;
