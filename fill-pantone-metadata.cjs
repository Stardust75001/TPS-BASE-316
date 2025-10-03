#!/usr/bin/env node

/**
 * Script pour remplir automatiquement les champs Name et Hex
 * des métaobjects Pantone Color de Shopify
 */

const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Mapping complet des codes Pantone vers les couleurs hexadécimales
const pantoneColors = {
  // === COULEURS DE BASE ===

  // Noir et gris
  "pantone-process-black-c": "#000000",
  "pantone-black-c": "#2B2926",
  "pantone-cool-gray-1-c": "#E5E1E6",
  "pantone-cool-gray-2-c": "#D6D2D4",
  "pantone-cool-gray-3-c": "#C4BFC4",
  "pantone-cool-gray-4-c": "#B3ADB3",
  "pantone-cool-gray-5-c": "#A19DA1",
  "pantone-cool-gray-6-c": "#908C90",
  "pantone-cool-gray-7-c": "#7F7B82",
  "pantone-cool-gray-8-c": "#6D6A75",
  "pantone-cool-gray-9-c": "#5C5A66",
  "pantone-cool-gray-10-c": "#4A4957",
  "pantone-cool-gray-11-c": "#363640",
  "pantone-warm-gray-1-c": "#E8E0D5",
  "pantone-warm-gray-2-c": "#DFD3C3",
  "pantone-warm-gray-3-c": "#D1C0A5",
  "pantone-warm-gray-4-c": "#C2AD8D",
  "pantone-warm-gray-5-c": "#B59B7A",
  "pantone-warm-gray-6-c": "#A68B5B",
  "pantone-warm-gray-7-c": "#998C7C",
  "pantone-warm-gray-8-c": "#8C7F70",
  "pantone-warm-gray-9-c": "#7F7265",
  "pantone-warm-gray-10-c": "#72665A",
  "pantone-warm-gray-11-c": "#65594F",

  // Rouge et bordeaux
  "pantone-186-c": "#CE2939",
  "pantone-red-032-c": "#EE2737",
  "pantone-200-c": "#8B0000",
  "pantone-209-c": "#6B2C3E",
  "pantone-18-1664-tpx": "#922B3E",
  "pantone-219-c": "#C51E54",
  "pantone-223-c": "#E30B5D",

  // Orange
  "pantone-021-c": "#FF6600",
  "pantone-165-c": "#FF8200",
  "pantone-orange-021-c": "#FF6900",

  // Jaune
  "pantone-7406-c": "#FFD700",
  "pantone-yellow-c": "#FFED00",
  "pantone-7401-c": "#FFF2CC",
  "pantone-7404-c": "#D4AF37",

  // Bleu
  "pantone-300-c": "#006BA6",
  "pantone-286-c": "#0033A0",
  "pantone-2995-c": "#00B7C3",
  "pantone-7687-c": "#2E3192",
  "pantone-process-blue-c": "#0085CA",
  "pantone-312-c": "#00A0A0",
  "pantone-264-c": "#7B68EE",

  // Vert
  "pantone-354-c": "#00A651",
  "pantone-7724-c": "#2E8B57",
  "pantone-321-c": "#00B7A8",
  "pantone-green-c": "#00AD69",
  "pantone-367-c": "#7CB518",
  "pantone-5773-c": "#8B8C7A",

  // Rose et violet
  "pantone-2587-c": "#E6007E",
  "pantone-purple-c": "#7B3F98",
  "pantone-rhodamine-red-c": "#E10098",
  "pantone-706-c": "#FFB6C1",

  // Marron et beige
  "pantone-468-c": "#F5F5DC",
  "pantone-469-c": "#8B4513",
  "pantone-brown-c": "#8B4513",

  // Métallique
  "pantone-877-c": "#C0C0C0",
  "pantone-871-c": "#D4AF37",

  // === COULEURS ÉTENDUES ===

  // Série 100 (Jaunes et oranges)
  "pantone-100-c": "#F5F27A",
  "pantone-101-c": "#F7ED4A",
  "pantone-102-c": "#F9E814",
  "pantone-108-c": "#FFD100",
  "pantone-109-c": "#FFC20E",
  "pantone-116-c": "#FFDE17",
  "pantone-117-c": "#FDD900",
  "pantone-118-c": "#FFD300",
  "pantone-119-c": "#FFD100",
  "pantone-120-c": "#FFCC00",
  "pantone-121-c": "#FFD700",
  "pantone-122-c": "#FFCC14",
  "pantone-123-c": "#FFC72C",
  "pantone-124-c": "#FF8C00",
  "pantone-125-c": "#FF7F00",
  "pantone-130-c": "#FF8C00",
  "pantone-131-c": "#FF7518",
  "pantone-132-c": "#FF6600",
  "pantone-133-c": "#FF5F00",
  "pantone-134-c": "#FF4500",
  "pantone-137-c": "#FF8243",
  "pantone-138-c": "#FF7518",
  "pantone-139-c": "#FF6600",
  "pantone-140-c": "#FF5500",
  "pantone-141-c": "#FF4500",
  "pantone-142-c": "#FF6B35",
  "pantone-143-c": "#FF5722",
  "pantone-144-c": "#FF4500",
  "pantone-145-c": "#FF3300",
  "pantone-146-c": "#FF1100",
  "pantone-147-c": "#FF6B47",
  "pantone-148-c": "#FF5533",
  "pantone-149-c": "#FF4422",
  "pantone-150-c": "#FF3311",
  "pantone-151-c": "#FF2200",
  "pantone-152-c": "#FF7F50",
  "pantone-153-c": "#FF6347",
  "pantone-154-c": "#FF4500",
  "pantone-155-c": "#FF3300",
  "pantone-156-c": "#FF1100",
  "pantone-157-c": "#FF8A80",
  "pantone-158-c": "#FF7043",
  "pantone-159-c": "#FF5722",
  "pantone-160-c": "#FF3D00",
  "pantone-161-c": "#FF1744",

  // Série 200 (Rouges et roses)
  "pantone-201-c": "#A0001E",
  "pantone-202-c": "#8B0000",
  "pantone-203-c": "#760019",
  "pantone-204-c": "#610014",
  "pantone-205-c": "#4C000F",
  "pantone-206-c": "#FF69B4",
  "pantone-207-c": "#FF1493",
  "pantone-208-c": "#DC143C",
  "pantone-210-c": "#8B008B",
  "pantone-211-c": "#9932CC",
  "pantone-212-c": "#BA55D3",
  "pantone-213-c": "#DDA0DD",
  "pantone-214-c": "#DA70D6",
  "pantone-215-c": "#EE82EE",
  "pantone-216-c": "#FF00FF",
  "pantone-217-c": "#C71585",
  "pantone-218-c": "#B22222",
  "pantone-220-c": "#FF1493",
  "pantone-221-c": "#FF69B4",
  "pantone-222-c": "#FFB6C1",
  "pantone-224-c": "#FFC0CB",
  "pantone-225-c": "#FFCCCB",
  "pantone-226-c": "#FF69B4",
  "pantone-227-c": "#FF1493",
  "pantone-228-c": "#DC143C",
  "pantone-229-c": "#B22222",
  "pantone-230-c": "#8B0000",

  // Série 300 (Bleus et verts)
  "pantone-301-c": "#005A9C",
  "pantone-302-c": "#004D87",
  "pantone-303-c": "#004072",
  "pantone-304-c": "#00335D",
  "pantone-305-c": "#002648",
  "pantone-306-c": "#00BFFF",
  "pantone-307-c": "#0099CC",
  "pantone-308-c": "#007399",
  "pantone-309-c": "#004D66",
  "pantone-310-c": "#002633",
  "pantone-311-c": "#00CED1",
  "pantone-313-c": "#00A0B0",
  "pantone-314-c": "#008080",
  "pantone-315-c": "#006060",
  "pantone-316-c": "#004040",
  "pantone-317-c": "#87CEEB",
  "pantone-318-c": "#4682B4",
  "pantone-319-c": "#00CED1",
  "pantone-320-c": "#40E0D0",
  "pantone-322-c": "#20B2AA",
  "pantone-323-c": "#48D1CC",
  "pantone-324-c": "#00FFFF",
  "pantone-325-c": "#E0FFFF",
  "pantone-326-c": "#AFEEEE",
  "pantone-327-c": "#40E0D0",
  "pantone-328-c": "#00CED1",
  "pantone-329-c": "#008B8B",
  "pantone-330-c": "#006767",

  // Ajout de couleurs de base communes
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
};

// Mapping des noms français pour les couleurs de base
const pantoneNamesMapping = {
  // Mapping par code
  "pantone-process-black-c": "Process Black",
  "pantone-black-c": "Black",
  "pantone-186-c": "Red 186",
  "pantone-red-032-c": "Red 032",
  "pantone-300-c": "Blue 300",
  "pantone-process-blue-c": "Process Blue",
  "pantone-354-c": "Green 354",
  "pantone-green-c": "Green",
  "pantone-yellow-c": "Yellow",
  "pantone-purple-c": "Purple",
  "pantone-orange-021-c": "Orange 021",

  // Mapping par nom simple
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
};

/**
 * Normalise un code Pantone pour le matching
 */
function normalizePantoneCode(code) {
  if (!code) return "";
  return code.toLowerCase().trim();
}

/**
 * Obtient la couleur hex et le nom pour un code donné
 */
function getPantoneData(code) {
  const normalizedCode = normalizePantoneCode(code);

  // Recherche directe
  const hex = pantoneColors[normalizedCode];
  const name = pantoneNamesMapping[normalizedCode];

  if (hex) {
    return {
      hex,
      name: name || formatPantoneName(code),
    };
  }

  // Essayer sans le suffixe '-c'
  const withoutSuffix = normalizedCode.replace(/-c$/, "");
  const hexWithoutSuffix = pantoneColors[withoutSuffix + "-c"];
  const nameWithoutSuffix = pantoneNamesMapping[withoutSuffix + "-c"];

  if (hexWithoutSuffix) {
    return {
      hex: hexWithoutSuffix,
      name: nameWithoutSuffix || formatPantoneName(code),
    };
  }

  return null;
}

/**
 * Formate un nom Pantone lisible
 */
function formatPantoneName(code) {
  if (!code) return "";

  // Nettoyer et formater le nom
  return code
    .replace(/^pantone-/, "")
    .replace(/-c$/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Fonction principale
 */
async function main() {
  console.log("🚀 Démarrage du script de remplissage des métadonnées Pantone");

  // Vérifier les variables d'environnement (support multiple formats)
  const shopDomain =
    process.env.SHOPIFY_SHOP_DOMAIN ||
    process.env.SHOPIFY_SHOP ||
    process.env.SHOP;

  const accessToken =
    process.env.SHOPIFY_ACCESS_TOKEN ||
    process.env.SHOPIFY_ADMIN_TOKEN ||
    process.env.ACCESS_TOKEN;

  if (!shopDomain || !accessToken) {
    console.error("❌ Variables d'environnement manquantes:");
    console.error("   Une de ces variables est requise pour le domaine:");
    console.error("   - SHOPIFY_SHOP_DOMAIN (format: ma-boutique)");
    console.error("   - SHOPIFY_SHOP (format: ma-boutique.myshopify.com)");
    console.error("   ");
    console.error("   Une de ces variables est requise pour le token:");
    console.error("   - SHOPIFY_ACCESS_TOKEN");
    console.error("   - SHOPIFY_ADMIN_TOKEN");
    console.error("   ");
    console.error("   Votre fichier .env actuel contient:");
    Object.keys(process.env)
      .filter((key) => key.includes("SHOPIFY"))
      .forEach((key) => {
        console.error(
          `   ${key}=${process.env[key] ? "***défini***" : "vide"}`
        );
      });
    process.exit(1);
  }

  // Normaliser le domaine (retirer .myshopify.com s'il est présent)
  const normalizedDomain = shopDomain.replace(".myshopify.com", "");

  console.log(`🏪 Boutique: ${normalizedDomain}.myshopify.com`);
  console.log(`🔑 Token: ${accessToken.substring(0, 8)}...`);

  // Sauvegarder pour les fonctions suivantes
  process.env.SHOPIFY_SHOP_DOMAIN = normalizedDomain;
  process.env.SHOPIFY_ACCESS_TOKEN = accessToken;

  try {
    // 1. Récupérer tous les métaobjects Pantone Color
    console.log("📋 Récupération des métaobjects Pantone Color...");
    const metaobjects = await fetchAllPantoneMetaobjects();
    console.log(`✅ Trouvé ${metaobjects.length} métaobjects`);

    if (metaobjects.length === 0) {
      console.log("⚠️ Aucun métaobject Pantone Color trouvé");
      return;
    }

    // 2. Analyser et préparer les mises à jour
    console.log("🔍 Analyse des métaobjects...");
    const updates = [];

    for (const metaobject of metaobjects) {
      const codeField = metaobject.fields.find((f) => f.key === "code");
      const nameField = metaobject.fields.find((f) => f.key === "name");
      const hexField = metaobject.fields.find((f) => f.key === "hex");

      if (!codeField?.value) {
        console.log(`⚠️ Métaobject ${metaobject.id} sans code, ignoré`);
        continue;
      }

      const code = codeField.value;
      const pantoneData = getPantoneData(code);

      if (!pantoneData) {
        console.log(`⚠️ Couleur non trouvée pour le code: ${code}`);
        continue;
      }

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

    console.log(`📝 ${updates.length} métaobjects nécessitent une mise à jour`);

    if (updates.length === 0) {
      console.log("✅ Tous les métaobjects sont déjà à jour!");
      return;
    }

    // 3. Demander confirmation
    if (!process.env.FORCE) {
      console.log("\n📋 Aperçu des mises à jour:");
      updates.slice(0, 5).forEach((update) => {
        console.log(`  • ${update.code}:`);
        if (update.updateName) console.log(`    - Name: "${update.newName}"`);
        if (update.updateHex) console.log(`    - Hex: "${update.newHex}"`);
      });

      if (updates.length > 5) {
        console.log(`  ... et ${updates.length - 5} autres`);
      }

      console.log("\n❓ Voulez-vous continuer? (ajoutez FORCE=1 pour forcer)");
      return;
    }

    // 4. Effectuer les mises à jour
    console.log("🔄 Début des mises à jour...");
    let successCount = 0;
    let errorCount = 0;

    for (const update of updates) {
      try {
        await updateMetaobject(update);
        successCount++;
        console.log(`✅ ${update.code} mis à jour`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Erreur pour ${update.code}:`, error.message);
      }
    }

    console.log(`\n🎉 Terminé! ${successCount} succès, ${errorCount} erreurs`);
  } catch (error) {
    console.error("💥 Erreur fatale:", error);
    process.exit(1);
  }
}

/**
 * Récupère tous les métaobjects Pantone Color
 */
async function fetchAllPantoneMetaobjects() {
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

    const response = await shopifyGraphQL(query, { cursor });
    const edges = response.data.metaobjects.edges;

    allMetaobjects.push(...edges.map((edge) => edge.node));

    cursor = response.data.metaobjects.pageInfo.hasNextPage
      ? response.data.metaobjects.pageInfo.endCursor
      : null;
  } while (cursor);

  return allMetaobjects;
}

/**
 * Met à jour un métaobject
 */
async function updateMetaobject(update) {
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

  const response = await shopifyGraphQL(mutation, variables);

  if (response.data.metaobjectUpdate.userErrors.length > 0) {
    throw new Error(
      response.data.metaobjectUpdate.userErrors.map((e) => e.message).join(", ")
    );
  }

  return response.data.metaobjectUpdate.metaobject;
}

/**
 * Effectue une requête GraphQL vers Shopify
 */
async function shopifyGraphQL(query, variables = {}) {
  const { SHOPIFY_SHOP_DOMAIN, SHOPIFY_ACCESS_TOKEN } = process.env;

  const response = await fetch(
    `https://${SHOPIFY_SHOP_DOMAIN}.myshopify.com/admin/api/2023-10/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
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

// Lancer le script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, getPantoneData, formatPantoneName };
