#!/usr/bin/env node

/**
 * DEBUG ERREUR 406
 * Analyser la réponse exacte de l'API
 */

const https = require("https");

const API_CONFIG = {
  shop: "f6d72e-0f",
  accessToken: "shpat_REDACTED",
  apiVersion: "2023-10",
};

function debugErrorResponse() {
  return new Promise((resolve, reject) => {
    const testColor = {
      name: "Debug Red",
      hex: "#FF0000",
      code: "debugred",
    };

    const postData = JSON.stringify({
      metaobject: {
        type: "colors",
        fields: [
          {
            key: "display_name",
            value: testColor.name,
          },
          {
            key: "hex_value",
            value: testColor.hex,
          },
          {
            key: "css_name",
            value: testColor.code,
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

    console.log("🔍 DEBUG ERREUR 406");
    console.log("==================");
    console.log("URL:", `https://${options.hostname}${options.path}`);
    console.log("Headers:", options.headers);
    console.log("Data:", postData);
    console.log("");

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        console.log("📊 RÉPONSE COMPLÈTE:");
        console.log("Status Code:", res.statusCode);
        console.log("Status Message:", res.statusMessage);
        console.log("Headers:", JSON.stringify(res.headers, null, 2));
        console.log("Body:", data);

        if (data) {
          try {
            const parsed = JSON.parse(data);
            console.log("");
            console.log("📋 BODY PARSÉ:");
            console.log(JSON.stringify(parsed, null, 2));

            if (parsed.errors) {
              console.log("");
              console.log("❌ ERREURS DÉTECTÉES:");
              console.log(JSON.stringify(parsed.errors, null, 2));
            }
          } catch (e) {
            console.log("❌ Impossible de parser le JSON");
          }
        }

        resolve();
      });
    });

    req.on("error", (error) => {
      console.log("❌ Request Error:", error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Vérifier aussi les permissions requises
function checkRequiredPermissions() {
  console.log("");
  console.log("🔐 PERMISSIONS REQUISES POUR METAOBJECTS:");
  console.log("=========================================");
  console.log("- write_metaobjects (pour créer)");
  console.log("- read_metaobjects (pour lire)");
  console.log("");
  console.log("💡 Si erreur 406:");
  console.log("1. Vérifier les permissions de l'app privée");
  console.log("2. Regénérer le token avec bonnes permissions");
  console.log('3. Vérifier que le metaobject "colors" existe');
}

async function main() {
  checkRequiredPermissions();
  await debugErrorResponse();
}

main().catch(console.error);
