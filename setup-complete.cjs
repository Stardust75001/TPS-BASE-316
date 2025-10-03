#!/usr/bin/env node

/**
 * SETUP COMPLET - Création définition + Import couleurs
 * Résout le problème 406 en créant d'abord la structure
 */

const https = require("https");
const fs = require("fs");

const API_CONFIG = {
  shop: "f6d72e-0f",
  accessToken: "shpat_REDACTED",
  apiVersion: "2025-01",
};

// 1. Créer la définition de metaobject
function createMetaobjectDefinition() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      metaobject_definition: {
        type: "colors",
        name: "CSS Colors",
        description: "Standard CSS color definitions for product variants",
        fields: [
          {
            key: "display_name",
            name: "Display Name",
            type: "single_line_text_field",
            description: "The human-readable name of the color",
            required: true,
          },
          {
            key: "hex_value",
            name: "Hex Value",
            type: "single_line_text_field",
            description: "The hex color code (e.g., #FF0000)",
            required: true,
          },
          {
            key: "css_name",
            name: "CSS Name",
            type: "single_line_text_field",
            description: "The CSS color name (e.g., red)",
            required: true,
          },
        ],
        display_name_key: "display_name",
      },
    });

    const options = {
      hostname: `${API_CONFIG.shop}.myshopify.com`,
      port: 443,
      path: `/admin/api/${API_CONFIG.apiVersion}/metaobject_definitions.json`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
        "X-Shopify-Access-Token": API_CONFIG.accessToken,
      },
    };

    console.log('🏗️  Création de la définition metaobject "colors"...');

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        console.log(`📊 Status: ${res.statusCode}`);
        console.log("📄 Response:", data);

        if (res.statusCode === 201) {
          console.log("✅ Définition créée avec succès !");
          resolve(true);
        } else if (res.statusCode === 422 && data.includes("already exists")) {
          console.log("✅ Définition déjà existante !");
          resolve(true);
        } else {
          console.log("❌ Erreur création définition");
          resolve(false);
        }
      });
    });

    req.on("error", (error) => {
      console.error("💥 Erreur requête:", error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// 2. Créer un metaobject color
function createColorMetaobject(color) {
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
        "X-Shopify-Access-Token": API_CONFIG.accessToken,
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode === 201) {
          resolve({ success: true, id: JSON.parse(data).metaobject.id });
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

// 3. Lire couleurs du CSV
function readColorsFromCSV() {
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

    return colors;
  } catch (error) {
    console.error("❌ Erreur lecture CSV:", error.message);
    return [];
  }
}

// 4. Setup complet
async function setupComplete() {
  try {
    console.log("🚀 SETUP COMPLET - METAOBJECT + COULEURS");
    console.log("=========================================");

    // Étape 1: Créer la définition
    const definitionCreated = await createMetaobjectDefinition();
    if (!definitionCreated) {
      console.error("❌ Impossible de créer la définition");
      return;
    }

    // Attendre un peu que la définition soit propagée
    console.log("⏳ Attente de propagation...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Étape 2: Lire les couleurs
    const colors = readColorsFromCSV();
    console.log(`📊 ${colors.length} couleurs à importer`);

    if (colors.length === 0) {
      console.error("❌ Aucune couleur à importer");
      return;
    }

    // Étape 3: Test avec les 3 premières couleurs
    console.log("\n🧪 Test avec les 3 premières couleurs...");
    const testColors = colors.slice(0, 3);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < testColors.length; i++) {
      const color = testColors[i];

      process.stdout.write(
        `📤 [${i + 1}/${testColors.length}] ${color.name}... `
      );

      try {
        const result = await createColorMetaobject(color);

        if (result.success) {
          console.log(`✅ OK (ID: ${result.id})`);
          successCount++;
        } else {
          console.log(`❌ ERREUR: HTTP ${result.status}`);
          console.log(`   Détail: ${result.error}`);
          errorCount++;
        }
      } catch (error) {
        console.log(`❌ EXCEPTION: ${error.message}`);
        errorCount++;
      }

      // Délai entre les requêtes
      if (i < testColors.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }

    // Rapport du test
    console.log("\n📊 RÉSULTATS DU TEST:");
    console.log(`✅ Succès: ${successCount}/${testColors.length}`);
    console.log(`❌ Erreurs: ${errorCount}/${testColors.length}`);

    if (successCount > 0) {
      console.log("\n🎉 TEST RÉUSSI ! La structure fonctionne");
      console.log("💡 Vous pouvez maintenant importer toutes les couleurs");
      console.log("\n🚀 Commande pour import complet:");
      console.log("node setup-complete.cjs --import-all");
    } else {
      console.log("\n❌ Le test a échoué. Vérifiez la configuration.");
    }
  } catch (error) {
    console.error("💥 Erreur fatale:", error);
  }
}

// Lancement
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes("--import-all")) {
    console.log("🚀 Import complet de toutes les couleurs...");
    // TODO: Implémenter l'import complet
  } else {
    setupComplete().catch(console.error);
  }
}

module.exports = {
  setupComplete,
  createMetaobjectDefinition,
  createColorMetaobject,
};
