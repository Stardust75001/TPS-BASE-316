#!/usr/bin/env node

// Script automatique pour remplir les champs hex des metaobjects Pantone dans Shopify
// Basé sur les conseils ChatGPT avec nos données existantes
//
// 🎯 POURQUOI CE SCRIPT FONCTIONNE :
//
// Votre thème cherche une couleur pour peindre les pastilles dans cet ordre :
// 1. variant.metafields.global.pantone → résout vers le handle du metaobject Pantone
// 2. Charge le champ 'hex' de ce metaobject → l'utilise pour la pastille
// 3. Si manquant, essaie les fallbacks (text → sampler), comme vu dans les logs
//
// Une fois le champ Hex rempli sur chaque entrée pantone_color, l'étape (2)
// réussit et les pastilles s'affichent avec la vraie couleur (plus besoin de
// hardcoder les hex par produit).
//
// Ce script automatise le remplissage de TOUS les champs hex manquants d'un coup !

require("dotenv").config();
const { default: fetch } = require("node-fetch");
const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

const SHOP = process.env.SHOPIFY_SHOP;
const API_VERSION = process.env.SHOPIFY_API_VERSION || "2024-07";
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const MAP_FILE = path.resolve(process.cwd(), "pantone-colors-import.csv");
const FORCE = process.argv.includes("--force");
const DRY_RUN = process.argv.includes("--dry");

if (!SHOP || !TOKEN) {
  console.error("❌ Missing env SHOPIFY_SHOP or SHOPIFY_ADMIN_TOKEN");
  process.exit(1);
}

if (!fs.existsSync(MAP_FILE)) {
  console.error("❌ Mapping file not found:", MAP_FILE);
  process.exit(1);
}

// 1) Load mapping from CSV
console.log("📁 Loading mapping from:", MAP_FILE);
const rows = fs.readFileSync(MAP_FILE, "utf8");
const data = parse(rows, { columns: true, skip_empty_lines: true });
console.log(`📊 Loaded ${data.length} color mappings`);

const norm = (s) => (s || "").toString().trim().toLowerCase();
const hexOk = (h) => /^#[0-9A-F]{6}$/i.test(h || "");
const toHash = (n) => (n.startsWith("#") ? n : "#" + n);

const byCode = new Map();
const byName = new Map();

// Ensure row is treated as an object with string keys
for (const row of data) {
  // Type assertion for CSV row data
  const r =
    /** @type {{Code?: string, code?: string, Name?: string, name?: string, Hex?: string, hex?: string}} */ (
      row || {}
    );
  const code = norm(r.Code || r.code || "");
  const name = norm(r.Name || r.name || "");
  const hex = r.Hex || r.hex || "";

  if (hexOk(hex)) {
    byCode.set(code, toHash(hex));
    if (name) byName.set(name, toHash(hex));
  }
}

if (byCode.size === 0 && byName.size === 0) {
  console.error(
    "❌ No valid hex in mapping file. Check columns code/name/hex."
  );
  process.exit(1);
}

console.log(
  `✅ Processed ${byCode.size} code mappings, ${byName.size} name mappings`
);

// 2) GraphQL query to fetch all pantone_color metaobjects
const gqlQuery = `
query GetPantone($after: String) {
  metaobjects(first: 100, type: "pantone_color", after: $after) {
    edges {
      cursor
      node {
        id
        handle
        fields { key value }
      }
    }
    pageInfo { hasNextPage endCursor }
  }
}`;

// 3) Fetch all metaobjects
async function fetchAllMetaobjects() {
  console.log("🔍 Fetching metaobjects (pantone_color)...");
  let after = null,
    all = [];

  do {
    const data = await gqlFetch(gqlQuery, { after });
    const mo = data.metaobjects;

    for (const { cursor, node } of mo.edges) {
      const obj = { id: node.id, handle: node.handle };
      for (const f of node.fields) obj[f.key] = f.value;
      all.push(obj);
      after = cursor;
    }

    if (mo.pageInfo.hasNextPage) {
      after = mo.pageInfo.endCursor;
      await new Promise((r) => setTimeout(r, 300)); // Rate limiting
    } else break;
  } while (true);

  console.log(`📋 Found ${all.length} pantone_color entries.`);
  return all;
}

// 4) Determine updates needed
async function determineUpdates() {
  const all = await fetchAllMetaobjects();
  const toUpdate = [];

  for (const o of all) {
    const currentHex = (o.hex || "").trim();
    if (currentHex && !FORCE) continue;

    // Try match by code then by name
    const code = norm(o.code || o.pantone_code || "");
    const name = norm(o.name || o.pantone_name || "");
    let hex = (code && byCode.get(code)) || "";

    if (!hex && name) hex = byName.get(name);

    if (hex && hexOk(hex)) {
      if (!currentHex || FORCE) {
        toUpdate.push({
          id: o.id,
          handle: o.handle,
          hex: toHash(hex),
          from: code || name || o.handle,
        });
      }
    }
  }

  console.log(
    `⚠️ Pending updates: ${toUpdate.length}${DRY_RUN ? " (dry-run)" : ""}`
  );

  if (toUpdate.length === 0) {
    console.log("✅ Nothing to update.");
    return;
  }

  return toUpdate;
}

// 5) GraphQL mutation to update metaobject
const updateMutation = `
mutation UpdateMetaobject($id: ID!, $fields: [MetaobjectFieldInput!]!) {
  metaobjectUpdate(id: $id, fields: [{ key: "hex", value: $hex }]) {
    userErrors { field message }
    metaobject { id }
  }
}`;

// 6) Execute updates
async function executeUpdates() {
  const toUpdate = await determineUpdates();
  if (!toUpdate || toUpdate.length === 0) return;

  console.log("🚀 Executing updates...");

  for (const { id, handle, hex, from } of toUpdate) {
    if (DRY_RUN) {
      console.log(`[DRY-RUN] Would update ${handle}: ${hex} (from: ${from})`);
      continue;
    }

    try {
      const result = await gqlFetch(updateMutation, {
        id,
        fields: [{ key: "hex", value: hex }],
      });

      if (result.metaobjectUpdate.userErrors.length > 0) {
        console.error(
          `❌ Error updating ${handle}:`,
          result.metaobjectUpdate.userErrors
        );
      } else {
        console.log(`✅ Updated ${handle}: ${hex} (from: ${from})`);
      }

      await new Promise((r) => setTimeout(r, 300)); // Rate limiting
    } catch (error) {
      console.error(`❌ Failed to update ${handle}:`, error.message);
    }
  }

  console.log("🎉 All updates completed!");
}

// GraphQL helper function
async function gqlFetch(query, variables = {}) {
  const response = await fetch(
    `https://${SHOP}/admin/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  const json = /** @type {{data?: any, errors?: any}} */ (
    await response.json()
  );
  if (!response.ok || json.errors) {
    throw new Error(
      "GraphQL error: " + JSON.stringify(json.errors || json, null, 2)
    );
  }

  return json.data;
}

// Execute main function
executeUpdates().catch(console.error);
