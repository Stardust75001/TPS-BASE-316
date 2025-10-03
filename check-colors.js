const https = require("https");

const TOKEN = "shpat_REDACTED";
const SHOP = "f6d72e-0f";
const API_VERSION = "2025-01";

function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = "";

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ statusCode: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: responseData });
        }
      });
    });

    req.on("error", reject);
    req.end();
  });
}

async function checkColors() {
  console.log("🔍 VÉRIFICATION DES COULEURS IMPORTÉES");
  console.log("======================================");

  const options = {
    hostname: `${SHOP}.myshopify.com`,
    port: 443,
    path: `/admin/api/${API_VERSION}/metaobjects.json?type=colors&limit=250`,
    method: "GET",
    headers: {
      "X-Shopify-Access-Token": TOKEN,
      "Content-Type": "application/json",
    },
  };

  try {
    const result = await makeRequest(options);

    if (result.statusCode === 200) {
      const colors = result.data.metaobjects || [];

      console.log(`✅ ${colors.length} couleurs trouvées dans Shopify`);
      console.log("");

      if (colors.length > 0) {
        console.log("📋 Exemples de couleurs:");
        console.log("========================");

        // Afficher les 10 premières couleurs
        colors.slice(0, 10).forEach((color, index) => {
          const fields = color.fields;
          const displayName =
            fields.find((f) => f.key === "display_name")?.value || "N/A";
          const hexValue =
            fields.find((f) => f.key === "hex_value")?.value || "N/A";
          const cssName =
            fields.find((f) => f.key === "css_name")?.value || "N/A";

          console.log(
            `${index + 1}. ${displayName.padEnd(20)} ${hexValue.padEnd(
              8
            )} ${cssName}`
          );
        });

        if (colors.length > 10) {
          console.log(`... et ${colors.length - 10} autres couleurs`);
        }

        console.log("");
        console.log("🎨 SYSTÈME DE COULEURS PRÊT !");
        console.log("");
        console.log(
          "Vous pouvez maintenant utiliser ces couleurs dans vos templates Liquid:"
        );
        console.log(
          "- Récupérer toutes les couleurs: {% assign colors = shop.metaobjects.colors.values %}"
        );
        console.log(
          "- Utiliser une couleur: {{ color.display_name }} - {{ color.hex_value }}"
        );
      } else {
        console.log("❌ Aucune couleur trouvée");
        console.log("Vérifiez que l'import s'est bien déroulé");
      }
    } else {
      console.error(`❌ Erreur API: ${result.statusCode}`);
      console.error(result.data);
    }
  } catch (error) {
    console.error("❌ Erreur réseau:", error.message);
  }
}

checkColors();
