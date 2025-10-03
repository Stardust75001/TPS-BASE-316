import fs from "node:fs";

const DOMAIN = process.env.SHOPIFY_SHOP_DOMAIN;   // ex: f6d72e-0f.myshopify.com
const TOKEN  = process.env.SHOPIFY_ADMIN_TOKEN;   // shpat_…

if (!DOMAIN || !TOKEN) {
  console.error("Missing env: SHOPIFY_SHOP_DOMAIN and/or SHOPIFY_ADMIN_TOKEN");
  process.exit(1);
}

const OUT = "notion_products_variants.csv";

const QUERY = `
query Products($cursor: String) {
  products(first: 100, after: $cursor, sortKey: UPDATED_AT) {
    pageInfo { hasNextPage endCursor }
    nodes {
      title
      handle
      productType
      status
      publishedAt
      onlineStoreUrl
      featuredImage { url }
      variants(first: 100) {
        nodes {
          sku
          price
          inventoryQuantity
          image { url }
        }
      }
    }
  }
}
`;

function csvCell(s) {
  const v = s == null ? "" : String(s);
  const esc = v.replace(/"/g, '""');
  return /[",\n]/.test(esc) ? `"${esc}"` : esc;
}

function normStatus(prodStatus, invQty) {
  const ps = (prodStatus || "").toLowerCase();
  if (ps !== "active") return "Brouillon";
  return (invQty ?? 0) > 0 ? "En ligne" : "Rupture";
}

async function fetchGraphQL(variables) {
  const res = await fetch(`https://${DOMAIN}/admin/api/2024-07/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": TOKEN
    },
    body: JSON.stringify({ query: QUERY, variables })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GraphQL HTTP ${res.status}: ${text}`);
  }
  const json = await res.json();
  if (json.errors) throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  return json.data;
}

async function main() {
  let cursor = null;
  const rows = [];

  do {
    const data = await fetchGraphQL({ cursor });
    const products = data.products;

    for (const p of products.nodes) {
      const productUrl = p.onlineStoreUrl || `https://thepetsociety.paris/products/${p.handle}`;
      const prodCat = p.productType || "";
      const featured = p.featuredImage?.url || "";
      const published = p.publishedAt ? new Date(p.publishedAt).toISOString().slice(0,10) : "";

      for (const v of p.variants.nodes) {
        const img = v.image?.url || featured || "";
        const status = normStatus(p.status, v.inventoryQuantity);
        rows.push({
          "Nom": p.title,
          "SKU": v.sku || "",
          "Prix": v.price ?? "",
          "Stock": v.inventoryQuantity ?? "",
          "Catégorie": prodCat,
          "URL Shopify": productUrl,
          "Image": img,
          "Statut": status,
          "Date d’ajout": published
        });
      }
    }

    cursor = products.pageInfo.hasNextPage ? products.pageInfo.endCursor : null;
  } while (cursor);

  const headers = ["Nom","SKU","Prix","Stock","Catégorie","URL Shopify","Image","Statut","Date d’ajout"];
  const lines = [headers.join(",")];
  for (const r of rows) lines.push(headers.map(h => csvCell(r[h])).join(","));
  fs.writeFileSync(OUT, lines.join("\n"), "utf8");
  console.log(`OK → ${OUT} (${rows.length} variantes exportées)`);
}

main().catch(err => { console.error(err); process.exit(1); });
