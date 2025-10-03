const https = require("https");

const TOKEN = process.env.SHOPIFY_ACCESS_TOKEN || "TOKEN_NOT_SET";
const SHOP = "f6d72e-0f";
const API_VERSION = "2025-01";

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: `${SHOP}.myshopify.com`,
      port: 443,
      path: `/admin/api/${API_VERSION}${path}`,
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": TOKEN,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on("error", reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error("Timeout"));
    });
    req.end();
  });
}

async function quickCheck() {
  console.log("🔍 DIAGNOSTIC RAPIDE - METAOBJECTS");
  console.log("===================================");

  try {
    // 1. Vérifier les définitions
    console.log("1. Vérification des définitions...");
    const definitions = await makeRequest("/metaobject_definitions.json");

    if (definitions.status === 200) {
      const colorsDef = definitions.data.metaobject_definitions?.find(
        (d) => d.type === "colors"
      );
      if (colorsDef) {
        console.log('✅ Définition "colors" trouvée');
        console.log(`   ID: ${colorsDef.id}`);
        console.log(
          `   Champs: ${colorsDef.field_definitions
            .map((f) => f.key)
            .join(", ")}`
        );
      } else {
        console.log('❌ Définition "colors" manquante');
        return;
      }
    } else {
      console.log(`❌ Erreur définitions: ${definitions.status}`);
      return;
    }

    // 2. Compter les metaobjects colors
    console.log("\n2. Comptage des metaobjects colors...");
    const count = await makeRequest("/metaobjects.json?type=colors&limit=1");

    if (count.status === 200) {
      const total = count.data.metaobjects?.length || 0;
      console.log(`📊 Nombre trouvé avec limit=1: ${total}`);

      // Essayer sans limite pour voir le vrai total
      const all = await makeRequest("/metaobjects.json?type=colors");
      if (all.status === 200) {
        const realTotal = all.data.metaobjects?.length || 0;
        console.log(`📊 Nombre total réel: ${realTotal}`);

        if (realTotal > 0) {
          console.log("\n📋 Premiers exemples:");
          all.data.metaobjects.slice(0, 5).forEach((obj, i) => {
            const fields = obj.fields || [];
            const name =
              fields.find((f) => f.key === "display_name")?.value || "N/A";
            const hex =
              fields.find((f) => f.key === "hex_value")?.value || "N/A";
            console.log(`   ${i + 1}. ${name} - ${hex}`);
          });
        }
      }
    } else {
      console.log(`❌ Erreur comptage: ${count.status}`);
      console.log(count.data);
    }
  } catch (error) {
    console.error("❌ Erreur:", error.message);
  }
}

quickCheck();
