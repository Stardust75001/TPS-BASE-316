#!/usr/bin/env node
/**
 * Crée / met à jour les metaobjects "pantone_color" depuis un CSV (code,name,hex).
 * Env requis : SHOPIFY_SHOP, SHOPIFY_ADMIN_TOKEN
 * Optionnel : SHOPIFY_API_VERSION (défaut 2024-07)
 *
 * Usage :
 *   node fill-pantone-metaobjects.cjs --csv ./pantone-hex.csv
 *   node fill-pantone-metaobjects.cjs --csv ./pantone-hex.csv --dry
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

const {
  SHOPIFY_SHOP,
  SHOPIFY_ADMIN_TOKEN,
  SHOPIFY_API_VERSION = "2024-07",
} = process.env;

if (!SHOPIFY_SHOP || !SHOPIFY_ADMIN_TOKEN) {
  console.error(
    "Variables environnement manquantes: SHOPIFY_SHOP et/ou SHOPIFY_ADMIN_TOKEN."
  );
  process.exit(1);
}

const args = process.argv.slice(2);
const getArg = (name, def = null) => {
  const i = args.findIndex((a) => a === name || a.startsWith(name + "="));
  if (i === -1) return def;
  const v = args[i].includes("=")
    ? args[i].split("=").slice(1).join("=")
    : args[i + 1];
  return v ?? def;
};
const CSV_FILE = getArg("--csv") || getArg("-c");
const DRY = args.includes("--dry");

if (!CSV_FILE) {
  console.error("Argument manquant: --csv /chemin/fichier.csv");
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function handleize(str) {
  // approximation du handle Shopify (accents -> ascii, minuscules, tirets)
  return (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "-and-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function pantoneHandleFromCode(code) {
  // ex: "PANTONE 354 C" -> "pantone-color-354-c"
  const norm = handleize(String(code).replace(/^pantone\s+/i, ""));
  return "pantone-color-" + norm.replace(/^pantone-/, "");
}

async function gql(query, variables = {}) {
  const res = await fetch(
    `https://${SHOPIFY_SHOP}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ADMIN_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    }
  );
  const json = await res.json();
  if (json.errors) {
    const msg = json.errors.map((e) => e.message).join("; ");
    throw new Error("GraphQL errors: " + msg);
  }
  return json;
}

async function fetchExistingPantoneMetaobjects() {
  const map = new Map(); // handle -> { id, fields: {code,name,hex}}
  let cursor = null;
  for (;;) {
    const q = `
      query($cursor: String){
        metaobjects(first: 250, type: "pantone_color", after: $cursor) {
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
    const data = await gql(q, { cursor });
    const edges = data.data.metaobjects.edges || [];
    for (const { node } of edges) {
      const f = Object.fromEntries(
        (node.fields || []).map((x) => [x.key, x.value])
      );
      map.set(node.handle, { id: node.id, fields: f });
    }
    const pi = data.data.metaobjects.pageInfo;
    if (!pi.hasNextPage) break;
    cursor = pi.endCursor;
    // petit throttle
    await sleep(80);
  }
  return map;
}

async function createPantone(handle, fields) {
  const m = `
    mutation($handle: String!, $fields: [MetaobjectFieldInput!]!) {
      metaobjectCreate(metaobject: {type: "pantone_color", handle: $handle, fields: $fields}) {
        metaobject { id handle }
        userErrors { field message }
      }
    }`;
  const vars = { handle, fields };
  if (DRY) {
    console.log(`(dry) CREATE ${handle}`, fields);
    return { id: "dry", handle };
  }
  const json = await gql(m, vars);
  const out = json.data.metaobjectCreate;
  if (out.userErrors?.length) {
    throw new Error(out.userErrors.map((e) => e.message).join("; "));
  }
  return out.metaobject;
}

async function updatePantone(id, fields) {
  const m = `
    mutation($id: ID!, $fields: [MetaobjectFieldInput!]!) {
      metaobjectUpdate(id: $id, metaobject: { fields: $fields }) {
        metaobject { id handle }
        userErrors { field message }
      }
    }`;
  const vars = { id, fields };
  if (DRY) {
    console.log(`(dry) UPDATE ${id}`, fields);
    return { id, handle: "dry" };
  }
  const json = await gql(m, vars);
  const out = json.data.metaobjectUpdate;
  if (out.userErrors?.length) {
    throw new Error(out.userErrors.map((e) => e.message).join("; "));
  }
  return out.metaobject;
}

(async () => {
  try {
    const csvAbs = path.resolve(process.cwd(), CSV_FILE);
    if (!fs.existsSync(csvAbs)) throw new Error(`CSV introuvable: ${csvAbs}`);

    const rows = /** @type {Array<Record<string, string>>} */ (
      parse(fs.readFileSync(csvAbs, "utf8"), {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      })
    );

    // Normalise colonnes
    const norm = (x) => (x ?? "").toString().trim();
    const data = rows
      .map((r) => ({
        code: norm(r.code || r.Code),
        name: norm(r.name || r.Name),
        hex: norm(r.hex || r.Hex || r.HEX),
      }))
      .filter((r) => r.code);

    console.log(`Lu ${data.length} lignes depuis ${csvAbs}`);

    console.log("Récupération des metaobjects pantone_color existants…");
    const existing = await fetchExistingPantoneMetaobjects();
    console.log(`${existing.size} entrées existantes chargées.`);

    let created = 0,
      updated = 0,
      skipped = 0;

    for (const row of data) {
      const handle = pantoneHandleFromCode(row.code);
      const fields = [
        { key: "pantone_color_code", value: row.code }, // si vos clés sont "code"/"name"/"hex", remplacez ci-dessous
        { key: "pantone_color_name", value: row.name },
        { key: "pantone_color_hex", value: row.hex },
      ];

      const has = existing.get(handle);
      if (!has) {
        console.log(
          `Create ${handle}  (${row.code} | ${row.name} | ${row.hex})`
        );
        await createPantone(handle, fields);
        created++;
      } else {
        // Compare pour éviter des updates inutiles
        const curr = has.fields || {};
        const need =
          curr.pantone_color_code !== row.code ||
          curr.pantone_color_name !== row.name ||
          curr.pantone_color_hex !== row.hex;

        if (need) {
          console.log(
            `Update ${handle}  (${row.code} | ${row.name} | ${row.hex})`
          );
          await updatePantone(has.id, fields);
          updated++;
        } else {
          skipped++;
        }
      }
      // throttle léger pour respecter la limite
      await sleep(120);
    }

    console.log(
      `\nTerminé. Créés: ${created}, Mis à jour: ${updated}, Inchangés: ${skipped}. ${
        DRY ? "(dry run)" : ""
      }`
    );
    console.log(
      "Type: pantone_color | Champs: pantone_color_code, pantone_color_name, pantone_color_hex"
    );
  } catch (e) {
    console.error("Erreur:", e.message || e);
    process.exit(1);
  }
})();
