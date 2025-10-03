import dotenv from "dotenv";
import fs from "fs";
import fetch from "node-fetch";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const SHOP = process.env.SHOPIFY_SHOP;
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const API_VERSION = "2023-10";

if (!SHOP || !TOKEN) {
  console.error("SHOPIFY_SHOP or SHOPIFY_ADMIN_TOKEN missing in .env");
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function splitCsvLine(line) {
  // Split by commas not inside quotes
  const parts = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      // Toggle quotes; handle double quotes inside quoted field
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      parts.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  parts.push(cur);
  return parts.map((s) => s.trim().replace(/^"|"$/g, ""));
}

function readCsv(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const header = splitCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const obj = {};
    for (let j = 0; j < header.length; j++) obj[header[j]] = cols[j] || "";
    rows.push(obj);
  }
  return rows;
}

async function fetchExistingPantoneMap() {
  const pantoneMap = new Map();
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
              fields { key value }
            }
          }
          pageInfo { hasNextPage endCursor }
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
    for (const edge of data.data.metaobjects.edges) {
      const node = edge.node;
      let name = node.fields.find((f) => f.key === "name")?.value || "";
      let code = node.fields.find((f) => f.key === "code")?.value || "";
      const keyName = name.trim().toLowerCase();
      const keyCode = code.trim().toLowerCase();
      if (keyName) pantoneMap.set(`name:${keyName}`, node.id);
      if (keyCode) pantoneMap.set(`code:${keyCode}`, node.id);
    }
    hasNextPage = data.data.metaobjects.pageInfo.hasNextPage;
    endCursor = data.data.metaobjects.pageInfo.endCursor;
    await sleep(400);
  }
  return pantoneMap;
}

async function createPantone({ name, code, hex }) {
  const fields = [];
  if (name) fields.push({ key: "name", value: name });
  if (code) fields.push({ key: "code", value: code });
  if (hex) fields.push({ key: "hex", value: hex });
  const mutation = `
    mutation CreatePantone($input: MetaobjectCreateInput!) {
      metaobjectCreate(metaobject: $input) {
        metaobject { id handle }
        userErrors { field message code }
      }
    }`;
  const body = {
    query: mutation,
    variables: {
      input: {
        type: "pantone_color",
        fields,
      },
    },
  };
  const res = await fetch(
    `https://${SHOP}/admin/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) throw new Error(`GraphQL ${res.status}: ${await res.text()}`);
  /** @type {any} */
  const data = await res.json();
  const ue = data.data.metaobjectCreate.userErrors;
  if (ue && ue.length) {
    throw new Error(`metaobjectCreate error: ${JSON.stringify(ue)}`);
  }
  return data.data.metaobjectCreate.metaobject;
}

async function main() {
  const args = process.argv.slice(2);
  const idx = args.findIndex((a) => a === "--csv");
  const DRY = process.env.DRY_RUN === "1" || args.includes("--dry");
  if (idx === -1 || !args[idx + 1]) {
    console.error(
      "Usage: node scripts/create-pantone-metaobjects.js --csv /absolute/path/to/file.csv [--dry]"
    );
    process.exit(1);
  }
  const csvPath = path.resolve(args[idx + 1]);
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV not found: ${csvPath}`);
    process.exit(1);
  }
  const rows = readCsv(csvPath);
  if (!rows.length) {
    console.error("CSV is empty");
    process.exit(1);
  }
  console.log(`Loaded ${rows.length} rows from ${csvPath}`);
  const existing = await fetchExistingPantoneMap();
  let created = 0,
    skipped = 0;
  for (const r of rows) {
    const name = (r.name || r.color || r.label || "").trim();
    const code = (r.code || r.pantone || "").trim();
    const hex = (r.hex || r.hexadecimal || r.hex_code || "").trim();
    if (!name && !code) {
      skipped++;
      continue;
    }
    const keyName = name.toLowerCase();
    const keyCode = code.toLowerCase();
    if (
      (keyName && existing.has(`name:${keyName}`)) ||
      (keyCode && existing.has(`code:${keyCode}`))
    ) {
      skipped++;
      continue;
    }
    console.log(
      `Creating: name='${name}' code='${code}' hex='${hex}'${
        DRY ? " [DRY]" : ""
      }`
    );
    if (!DRY) {
      await createPantone({ name, code, hex });
      created++;
      // update caches so we don't create duplicates within same run
      if (keyName) existing.set(`name:${keyName}`, "1");
      if (keyCode) existing.set(`code:${keyCode}`, "1");
      await sleep(500);
    }
  }
  console.log(`Done. Created ${created}, skipped ${skipped}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
