#!/usr/bin/env node

/**
 * Script Hybride de Gestion des Métadonnées Pantone
 * Combine l'approche directe API avec l'enrichissement CSV style ChatGPT
 */

const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Mapping Pantone étendu inspiré de ChatGPT
const EXTENDED_PANTONE_COLORS = {
  // === BASE COLORS (Notre mapping existant) ===
  "pantone-process-black-c": "#000000",
  "pantone-black-c": "#2B2926",
  "pantone-186-c": "#CE2939",
  "pantone-red-032-c": "#EE2737",
  "pantone-300-c": "#006BA6",
  "pantone-process-blue-c": "#0085CA",
  "pantone-354-c": "#00A651",
  "pantone-green-c": "#00AD69",
  "pantone-yellow-c": "#FFED00",
  "pantone-purple-c": "#7B3F98",
  "pantone-orange-021-c": "#FF6900",

  // === EXTENDED COLORS (Style ChatGPT) ===
  // Pantone Coated Series
  "pantone-100-c": "#F5F27A",
  "pantone-101-c": "#F7ED4A",
  "pantone-102-c": "#F9E814",
  "pantone-103-c": "#C4D831",
  "pantone-104-c": "#A4B82C",
  "pantone-105-c": "#859C27",
  "pantone-106-c": "#6B8023",
  "pantone-107-c": "#51641E",
  "pantone-108-c": "#FFD100",
  "pantone-109-c": "#FFC20E",
  "pantone-110-c": "#FFB81C",
  "pantone-111-c": "#FFAD2A",
  "pantone-112-c": "#FFA238",
  "pantone-113-c": "#FF9746",
  "pantone-114-c": "#FF8C54",
  "pantone-115-c": "#FF8162",

  // Pantone Uncoated Series (U)
  "pantone-100-u": "#F2F0A1",
  "pantone-101-u": "#F0ED7A",
  "pantone-102-u": "#EDEA52",
  "pantone-yellow-u": "#F7ED4A",
  "pantone-orange-021-u": "#FF944A",

  // Pantone Metallic
  "pantone-871-c": "#D4AF37", // Gold
  "pantone-877-c": "#C0C0C0", // Silver
  "pantone-8003-c": "#CD7F32", // Bronze
  "pantone-8321-c": "#FFD700", // Bright Gold
  "pantone-8005-c": "#B8860B", // Dark Gold

  // Pantone Fluorescent
  "pantone-801-c": "#FF1493", // Fluorescent Pink
  "pantone-802-c": "#00FF00", // Fluorescent Green
  "pantone-803-c": "#FFFF00", // Fluorescent Yellow
  "pantone-804-c": "#FFA500", // Fluorescent Orange

  // Pantone Pastels
  "pantone-9181-c": "#F0E6FF", // Pale Lavender
  "pantone-9182-c": "#E6F0FF", // Pale Blue
  "pantone-9183-c": "#E6FFE6", // Pale Green
  "pantone-9184-c": "#FFFFE6", // Pale Yellow

  // Basic Colors (amélioration de notre mapping)
  red: "#FF0000",
  blue: "#0000FF",
  green: "#008000",
  yellow: "#FFFF00",
  orange: "#FFA500",
  purple: "#800080",
  pink: "#FFC0CB",
  brown: "#8B4513",
  black: "#000000",
  white: "#FFFFFF",
  gray: "#808080",
  grey: "#808080",
  beige: "#F5F5DC",
  navy: "#000080",
  maroon: "#800000",
  teal: "#008080",
  olive: "#808000",
  lime: "#00FF00",
  aqua: "#00FFFF",
  silver: "#C0C0C0",
  fuchsia: "#FF00FF",

  // Extended French Color Names
  rouge: "#FF0000",
  bleu: "#0000FF",
  vert: "#008000",
  jaune: "#FFFF00",
  violet: "#800080",
  rose: "#FFC0CB",
  marron: "#8B4513",
  noir: "#000000",
  blanc: "#FFFFFF",
  gris: "#808080",
};

// Mapping des noms étendus (Style ChatGPT)
const EXTENDED_NAME_MAPPING = {
  // Pantone officiel
  "pantone-process-black-c": "Process Black C",
  "pantone-black-c": "Black C",
  "pantone-186-c": "Red 186 C",
  "pantone-300-c": "Blue 300 C",
  "pantone-354-c": "Green 354 C",
  "pantone-yellow-c": "Yellow C",
  "pantone-purple-c": "Purple C",
  "pantone-orange-021-c": "Orange 021 C",

  // Métalliques
  "pantone-871-c": "Or Métallique",
  "pantone-877-c": "Argent Métallique",
  "pantone-8003-c": "Bronze Métallique",

  // Fluorescents
  "pantone-801-c": "Rose Fluo",
  "pantone-802-c": "Vert Fluo",
  "pantone-803-c": "Jaune Fluo",
  "pantone-804-c": "Orange Fluo",

  // Couleurs de base étendues
  red: "Rouge",
  blue: "Bleu",
  green: "Vert",
  yellow: "Jaune",
  orange: "Orange",
  purple: "Violet",
  pink: "Rose",
  brown: "Marron",
  black: "Noir",
  white: "Blanc",
  gray: "Gris",
  grey: "Gris",
  beige: "Beige",
  navy: "Bleu Marine",
  maroon: "Bordeaux",
  teal: "Sarcelle",
  olive: "Olive",
  lime: "Citron Vert",
  aqua: "Aqua",
  silver: "Argent",
  fuchsia: "Fuchsia",

  // Noms français directs
  rouge: "Rouge",
  bleu: "Bleu",
  vert: "Vert",
  jaune: "Jaune",
  violet: "Violet",
  rose: "Rose",
  marron: "Marron",
  noir: "Noir",
  blanc: "Blanc",
  gris: "Gris",
};

/**
 * Configuration des modes d'opération (Style ChatGPT)
 */
const OPERATION_MODES = {
  PREVIEW: "preview",
  CSV_EXPORT: "csv-export",
  CSV_IMPORT: "csv-import",
  API_DIRECT: "api-direct",
  HYBRID: "hybrid",
};

/**
 * Classe principale du gestionnaire hybride
 */
class HybridPantoneManager {
  constructor() {
    this.shopDomain = this.getShopDomain();
    this.accessToken = this.getAccessToken();
    this.validateConfig();
  }

  getShopDomain() {
    return (
      process.env.SHOPIFY_SHOP_DOMAIN ||
      process.env.SHOPIFY_SHOP?.replace(".myshopify.com", "") ||
      process.env.SHOP
    );
  }

  getAccessToken() {
    return (
      process.env.SHOPIFY_ACCESS_TOKEN ||
      process.env.SHOPIFY_ADMIN_TOKEN ||
      process.env.ACCESS_TOKEN
    );
  }

  validateConfig() {
    if (!this.shopDomain || !this.accessToken) {
      console.error("❌ Configuration manquante:");
      console.error("   Domaine:", this.shopDomain ? "✅" : "❌");
      console.error("   Token:", this.accessToken ? "✅" : "❌");
      process.exit(1);
    }
    console.log(`🏪 Boutique: ${this.shopDomain}.myshopify.com`);
  }

  /**
   * Mode Preview - Affiche ce qui sera modifié
   */
  async preview() {
    console.log("👁️ Mode Prévisualisation");
    const metaobjects = await this.fetchAllPantoneMetaobjects();
    const analysis = this.analyzeMetaobjects(metaobjects);
    this.displayPreview(analysis);
    return analysis;
  }

  /**
   * Mode CSV Export - Exporte les données vers CSV (Style ChatGPT)
   */
  async csvExport(filename = "pantone-export.csv") {
    console.log("📄 Mode Export CSV");
    const metaobjects = await this.fetchAllPantoneMetaobjects();
    const csvData = this.convertToCSV(metaobjects);

    fs.writeFileSync(filename, csvData);
    console.log(`✅ Export CSV créé: ${filename}`);
    return filename;
  }

  /**
   * Mode CSV Import - Importe depuis CSV (Style ChatGPT)
   */
  async csvImport(filename) {
    console.log("📥 Mode Import CSV");
    if (!fs.existsSync(filename)) {
      throw new Error(`Fichier CSV introuvable: ${filename}`);
    }

    const csvData = fs.readFileSync(filename, "utf8");
    const updates = this.parseCSV(csvData);
    return await this.applyUpdates(updates);
  }

  /**
   * Mode API Direct - Notre approche originale
   */
  async apiDirect() {
    console.log("🚀 Mode API Direct");
    const metaobjects = await this.fetchAllPantoneMetaobjects();
    const updates = this.prepareDirectUpdates(metaobjects);
    return await this.applyUpdates(updates);
  }

  /**
   * Mode Hybride - Combine les deux approches
   */
  async hybrid() {
    console.log("🔄 Mode Hybride");

    // 1. Analyse initiale
    const analysis = await this.preview();

    // 2. Export CSV pour enrichissement
    const csvFile = await this.csvExport("pantone-hybrid-temp.csv");

    // 3. Enrichissement automatique du CSV
    await this.enrichCSV(csvFile);

    // 4. Import des données enrichies
    const result = await this.csvImport(csvFile);

    // 5. Nettoyage
    fs.unlinkSync(csvFile);

    return result;
  }

  /**
   * Enrichit automatiquement un fichier CSV avec notre mapping étendu
   */
  async enrichCSV(filename) {
    console.log("🔧 Enrichissement automatique du CSV");

    let csvContent = fs.readFileSync(filename, "utf8");
    const lines = csvContent.split("\n");
    const header = lines[0];

    const enrichedLines = [header];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const columns = line.split(",");
      const code = columns[1]?.replace(/"/g, ""); // Assuming code is in column 1

      if (code) {
        const pantoneData = this.getPantoneData(code);
        if (pantoneData) {
          // Update name and hex columns
          columns[2] = `"${pantoneData.name}"`;
          columns[3] = `"${pantoneData.hex}"`;
        }
      }

      enrichedLines.push(columns.join(","));
    }

    fs.writeFileSync(filename, enrichedLines.join("\n"));
    console.log("✅ CSV enrichi automatiquement");
  }

  /**
   * Obtient les données Pantone étendues
   */
  getPantoneData(code) {
    if (!code) return null;

    const normalizedCode = code.toLowerCase().trim();
    const hex = EXTENDED_PANTONE_COLORS[normalizedCode];
    const name = EXTENDED_NAME_MAPPING[normalizedCode];

    if (hex) {
      return {
        hex,
        name: name || this.formatPantoneName(code),
      };
    }

    return null;
  }

  formatPantoneName(code) {
    return code
      .replace(/^pantone-/, "")
      .replace(/-c$/, "")
      .replace(/-u$/, "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  /**
   * Convertit les métaobjects en CSV
   */
  convertToCSV(metaobjects) {
    const header = "ID,Code,Name,Hex,Handle,Updated\n";
    const rows = metaobjects
      .map((obj) => {
        const code = obj.fields.find((f) => f.key === "code")?.value || "";
        const name = obj.fields.find((f) => f.key === "name")?.value || "";
        const hex = obj.fields.find((f) => f.key === "hex")?.value || "";

        return `"${obj.id}","${code}","${name}","${hex}","${obj.handle}","false"`;
      })
      .join("\n");

    return header + rows;
  }

  /**
   * Parse un fichier CSV
   */
  parseCSV(csvData) {
    const lines = csvData.split("\n");
    const updates = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const [id, code, name, hex, handle, shouldUpdate] = line
        .split(",")
        .map((col) => col.replace(/"/g, ""));

      if (shouldUpdate === "true" && name && hex) {
        updates.push({
          id,
          code,
          updateName: true,
          updateHex: true,
          newName: name,
          newHex: hex,
        });
      }
    }

    return updates;
  }

  /**
   * Prépare les mises à jour directes à partir des métaobjects
   */
  prepareDirectUpdates(metaobjects) {
    const updates = [];

    for (const metaobject of metaobjects) {
      const codeField = metaobject.fields.find((f) => f.key === "code");
      const nameField = metaobject.fields.find((f) => f.key === "name");
      const hexField = metaobject.fields.find((f) => f.key === "hex");

      if (!codeField?.value) continue;

      const code = codeField.value;
      const pantoneData = this.getPantoneData(code);

      if (!pantoneData) continue;

      const needsUpdate = {
        id: metaobject.id,
        code,
        updateName: !nameField?.value && pantoneData.name,
        updateHex: !hexField?.value && pantoneData.hex,
        newName: pantoneData.name,
        newHex: pantoneData.hex,
      };

      if (needsUpdate.updateName || needsUpdate.updateHex) {
        updates.push(needsUpdate);
      }
    }

    return updates;
  }

  /**
   * Applique les mises à jour via l'API Shopify
   */
  async applyUpdates(updates) {
    if (!updates || updates.length === 0) {
      console.log("✅ Aucune mise à jour nécessaire");
      return { successCount: 0, errorCount: 0, errors: [] };
    }

    console.log(`🔄 Application de ${updates.length} mises à jour...`);
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const update of updates) {
      try {
        await this.updateMetaobject(update);
        successCount++;
        console.log(`✅ ${update.code} mis à jour`);
      } catch (error) {
        errorCount++;
        errors.push({ code: update.code, error: error.message });
        console.error(`❌ Erreur pour ${update.code}:`, error.message);
      }
    }

    console.log(`\n🎉 Terminé! ${successCount} succès, ${errorCount} erreurs`);
    return { successCount, errorCount, errors };
  }

  /**
   * Met à jour un métaobject individuel
   */
  async updateMetaobject(update) {
    const fields = [];

    if (update.updateName) {
      fields.push({ key: "name", value: update.newName });
    }

    if (update.updateHex) {
      fields.push({ key: "hex", value: update.newHex });
    }

    if (fields.length === 0) return;

    const mutation = `
      mutation UpdateMetaobject($id: ID!, $metaobject: MetaobjectUpdateInput!) {
        metaobjectUpdate(id: $id, metaobject: $metaobject) {
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
      id: update.id,
      metaobject: { fields },
    };

    const response = await this.shopifyGraphQL(mutation, variables);

    if (response.data.metaobjectUpdate.userErrors.length > 0) {
      throw new Error(
        response.data.metaobjectUpdate.userErrors
          .map((e) => e.message)
          .join(", ")
      );
    }

    return response.data.metaobjectUpdate.metaobject;
  }

  // [Les autres méthodes restent identiques à notre script original]
  async fetchAllPantoneMetaobjects() {
    // Implémentation identique...
    const allMetaobjects = [];
    let cursor = null;

    do {
      const query = `
        query GetPantoneMetaobjects($cursor: String) {
          metaobjects(type: "pantone_color", first: 50, after: $cursor) {
            edges {
              cursor
              node {
                id
                handle
                fields {
                  key
                  value
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `;

      const response = await this.shopifyGraphQL(query, { cursor });
      const edges = response.data.metaobjects.edges;

      allMetaobjects.push(...edges.map((edge) => edge.node));

      cursor = response.data.metaobjects.pageInfo.hasNextPage
        ? response.data.metaobjects.pageInfo.endCursor
        : null;
    } while (cursor);

    return allMetaobjects;
  }

  analyzeMetaobjects(metaobjects) {
    // Implémentation de l'analyse...
    const updates = [];

    for (const metaobject of metaobjects) {
      const codeField = metaobject.fields.find((f) => f.key === "code");
      const nameField = metaobject.fields.find((f) => f.key === "name");
      const hexField = metaobject.fields.find((f) => f.key === "hex");

      if (!codeField?.value) continue;

      const code = codeField.value;
      const pantoneData = this.getPantoneData(code);

      if (!pantoneData) continue;

      const needsUpdate = {
        id: metaobject.id,
        code,
        updateName: !nameField?.value && pantoneData.name,
        updateHex: !hexField?.value && pantoneData.hex,
        newName: pantoneData.name,
        newHex: pantoneData.hex,
      };

      if (needsUpdate.updateName || needsUpdate.updateHex) {
        updates.push(needsUpdate);
      }
    }

    return {
      total: metaobjects.length,
      updates,
      needsUpdate: updates.length,
    };
  }

  displayPreview(analysis) {
    console.log(
      `\n📊 Analyse: ${analysis.total} métaobjects, ${analysis.needsUpdate} à mettre à jour`
    );

    if (analysis.updates.length > 0) {
      console.log("\n📋 Aperçu des mises à jour:");
      analysis.updates.slice(0, 5).forEach((update) => {
        console.log(`  • ${update.code}:`);
        if (update.updateName) console.log(`    - Name: "${update.newName}"`);
        if (update.updateHex) console.log(`    - Hex: "${update.newHex}"`);
      });

      if (analysis.updates.length > 5) {
        console.log(`  ... et ${analysis.updates.length - 5} autres`);
      }
    }
  }

  async shopifyGraphQL(query, variables = {}) {
    const response = await fetch(
      `https://${this.shopDomain}.myshopify.com/admin/api/2023-10/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": this.accessToken,
        },
        body: JSON.stringify({ query, variables }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(`GraphQL Error: ${JSON.stringify(data.errors)}`);
    }

    return data;
  }
}

/**
 * Interface CLI
 */
async function main() {
  const mode = process.argv[2] || OPERATION_MODES.PREVIEW;
  const manager = new HybridPantoneManager();

  console.log("🚀 Gestionnaire Hybride de Métadonnées Pantone");
  console.log("=".repeat(50));

  try {
    switch (mode) {
      case OPERATION_MODES.PREVIEW:
        await manager.preview();
        break;

      case OPERATION_MODES.CSV_EXPORT:
        const filename = process.argv[3] || "pantone-export.csv";
        await manager.csvExport(filename);
        break;

      case OPERATION_MODES.CSV_IMPORT:
        const importFile = process.argv[3];
        if (!importFile) {
          throw new Error("Nom du fichier CSV requis pour l'import");
        }
        await manager.csvImport(importFile);
        break;

      case OPERATION_MODES.API_DIRECT:
        await manager.apiDirect();
        break;

      case OPERATION_MODES.HYBRID:
        await manager.hybrid();
        break;

      default:
        console.error("❌ Mode non reconnu. Modes disponibles:");
        console.error("   preview, csv-export, csv-import, api-direct, hybrid");
        process.exit(1);
    }

    console.log("\n🎉 Opération terminée avec succès!");
  } catch (error) {
    console.error("💥 Erreur:", error.message);
    process.exit(1);
  }
}

// Export pour utilisation en module
module.exports = {
  HybridPantoneManager,
  EXTENDED_PANTONE_COLORS,
  EXTENDED_NAME_MAPPING,
};

// Exécution CLI
if (require.main === module) {
  main().catch(console.error);
}
