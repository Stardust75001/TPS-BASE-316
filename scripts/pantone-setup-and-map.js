import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const SHOP = process.env.SHOPIFY_SHOP;
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const API_VERSION = "2023-10";
const PANTONE_NAMESPACE = "custom";
const PANTONE_KEY = "color_pantone";
const DRY_RUN = process.env.DRY_RUN === "1" || process.argv.includes("--dry");

if (!SHOP || !TOKEN) {
  console.error("SHOPIFY_SHOP or SHOPIFY_ADMIN_TOKEN missing in .env");
  process.exit(1);
}

/**
 * Minimal REST helper
 * @param {string} endpoint
 * @param {("GET"|"POST"|"PUT"|"DELETE")} [method]
 * @param {any} [body]
 * @returns {Promise<any>}
 */
const api = async (endpoint, method = "GET", body = null) => {
  const url = `https://${SHOP}/admin/api/${API_VERSION}/${endpoint}`;
  const options = {
    method,
    headers: {
      "X-Shopify-Access-Token": TOKEN,
      "Content-Type": "application/json",
    },
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(url, options);
  if (!res.ok)
    throw new Error(`${res.status} ${res.statusText}: ${await res.text()}`);
  return res.json();
};

/** @returns {Promise<any[]>} */
async function getAllProducts() {
  let products = [];
  let since_id = 0;
  while (true) {
    const res = await api(
      `products.json?limit=250${since_id ? `&since_id=${since_id}` : ""}`
    );
    if (!res.products.length) break;
    products = products.concat(res.products);
    if (res.products.length < 250) break;
    since_id = res.products[res.products.length - 1].id;
  }
  return products;
}

/** @returns {Promise<Record<string, string>>} */
async function getPantoneMetaobjectIds() {
  // Utilise l'API GraphQL pour lister tous les metaobjects Pantone
  /** @type {Record<string, string>} */
  const pantoneMap = {};
  let hasNextPage = true;
  let endCursor = null;
  while (hasNextPage) {
    const query = `
      query PantoneMetaobjects($after: String) {
        metaobjects(first: 100, type: "pantone_color", after: $after) {
          edges {
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
      }`;

    const res = await fetch(
      `https://${SHOP}/admin/api/${API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, variables: { after: endCursor } }),
      }
    );
    if (!res.ok) throw new Error(`GraphQL ${res.status}: ${await res.text()}`);
    /** @type {any} */
    const data = await res.json();
    const edges = data.data.metaobjects.edges;
    for (const edge of edges) {
      const node = edge.node;
      // DEBUG: Affiche tous les metaobjects trouvés
      console.log("[Pantone Metaobject]", {
        id: node.id,
        handle: node.handle,
        fields: node.fields,
      });
      // Recherche un champ pertinent pour lier la couleur (ex: name, code, handle)
      let key = null;
      for (const f of node.fields) {
        if (f.key === "name" || f.key === "code") {
          key = f.value;
          break;
        }
      }
      if (!key) key = node.handle;
      // Normalisation (minuscule, trim)
      if (key) {
        pantoneMap[key.trim().toLowerCase()] = node.id;
      }
    }
    hasNextPage = data.data.metaobjects.pageInfo.hasNextPage;
    endCursor = data.data.metaobjects.pageInfo.endCursor;
    await new Promise((r) => setTimeout(r, 600)); // anti-429
  }
  return pantoneMap;
}

async function ensurePantoneMetafield(variantId, pantoneMetaobjectId) {
  // Set metafield for variant
  const body = {
    metafield: {
      namespace: PANTONE_NAMESPACE,
      key: PANTONE_KEY,
      type: "metaobject_reference",
      value: pantoneMetaobjectId,
      owner_id: variantId,
      owner_resource: "variant",
    },
  };
  try {
    await api(`variants/${variantId}/metafields.json`, "POST", body);
    return true;
  } catch (e) {
    // Try update if already exists
    if (e.message.includes("already exists")) {
      // Get metafield id
      const res = await api(`variants/${variantId}/metafields.json`);
      const mf = res.metafields.find(
        (mf) => mf.namespace === PANTONE_NAMESPACE && mf.key === PANTONE_KEY
      );
      if (mf) {
        await api(`metafields/${mf.id}.json`, "PUT", {
          metafield: { id: mf.id, value: pantoneMetaobjectId },
        });
        return true;
      }
    }
    throw e;
  }
}

// Dictionnaire d'alias exacts pour certaines valeurs d'options → clé Pantone attendue
// Clés en minuscules; les valeurs seront normalisées en minuscules lors de la recherche dans pantoneMap.
const EXACT_MAP = {
  // ---- ajouts personnalisés ----
  "brown toast": "PANTONE 7406 C",
  "yellow toast": "PANTONE 7406 C",
  "brown bear": "PANTONE 200 C",
  "cute little chicken": "PANTONE 123 C",
  "velvet green": "PANTONE 7724 C",
  "grey mangosteen": "PANTONE Cool Gray 7 C",
  "gray mangosteen": "PANTONE Cool Gray 7 C",
  "green mangosteen": "PANTONE 354 C",
  "cute deer deer": "PANTONE 186 C",
  "cute dolphin": "PANTONE 2995 C",
};

async function main() {
  const mode = process.argv.includes("--export-colors") ? "export" : "map";

  if (mode === "export") {
    console.log("Extracting unique color names from all variants...");
    const products = await getAllProducts();
    const colorSet = new Set();
    for (const product of products) {
      for (const variant of product.variants) {
        let keys = [
          variant.option1,
          variant.option2,
          variant.option3,
          variant.title,
        ];
        for (let k of keys) {
          if (k && typeof k === "string" && k.trim()) colorSet.add(k.trim());
        }
      }
    }
    const colorList = Array.from(colorSet).sort((a, b) =>
      a.localeCompare(b, "fr")
    );
    const fs = await import("fs");
    const csvLines = ["name,code,hex", ...colorList.map((name) => `${name},,`)];
    const outPath = path.resolve(process.cwd(), "pantone-colors-template.csv");
    fs.writeFileSync(outPath, csvLines.join("\n"), "utf8");
    console.log(`\nTemplate CSV generated: ${outPath}`);
    console.log(
      "Remplissez ce fichier, puis lancez la création des metaobjects."
    );
    return;
  }

  console.log("Fetching Pantone metaobjects...");
  const pantoneMap = await getPantoneMetaobjectIds();
  if (!Object.keys(pantoneMap).length) {
    console.error("No Pantone metaobjects found. Aborting.");
    process.exit(1);
  }
  console.log("Fetching all products and variants...");
  const products = await getAllProducts();
  let fixed = 0,
    checked = 0;
  for (const product of products) {
    for (const variant of product.variants) {
      checked++;
      const res = await api(`variants/${variant.id}/metafields.json`);
      const pantoneMf = res.metafields.find(
        (mf) => mf.namespace === PANTONE_NAMESPACE && mf.key === PANTONE_KEY
      );
      let pantoneId = pantoneMf?.value;
      let pantoneKey = variant.option1 || variant.title;
      let normKey = pantoneKey ? pantoneKey.trim().toLowerCase() : "";
      let lookupKey = EXACT_MAP[normKey]
        ? EXACT_MAP[normKey].trim().toLowerCase()
        : normKey;
      if (!pantoneMap[lookupKey]) {
        pantoneKey = variant.option2 || variant.option3 || pantoneKey;
        normKey = pantoneKey ? pantoneKey.trim().toLowerCase() : "";
        lookupKey = EXACT_MAP[normKey]
          ? EXACT_MAP[normKey].trim().toLowerCase()
          : normKey;
      }
      const correctPantoneId = pantoneMap[lookupKey];
      if (!correctPantoneId) {
        console.warn(
          `No Pantone metaobject found for variant ${variant.id} (${pantoneKey})`
        );
        await new Promise((r) => setTimeout(r, 600));
        continue;
      }
      if (pantoneId !== correctPantoneId) {
        if (DRY_RUN) {
          console.log(
            `[DRY] Would map variant ${variant.id} (${pantoneKey}) -> ${correctPantoneId} (key='${lookupKey}')`
          );
        } else {
          await ensurePantoneMetafield(variant.id, correctPantoneId);
          fixed++;
          console.log(
            `Fixed mapping for variant ${variant.id} (${pantoneKey})`
          );
        }
      }
      await new Promise((r) => setTimeout(r, 600));
    }
  }
  console.log(`Checked ${checked} variants. Fixed ${fixed} mappings.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
