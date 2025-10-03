#!/usr/bin/env node

/**
 * DEBUG API PERMISSIONS
 * Test des permissions exactes requises
 */

const https = require("https");

const API_CONFIG = {
  shop: "f6d72e-0f",
  accessToken: "shpat_REDACTED",
  apiVersion: "2023-10",
};

// Test permissions metaobjects
function testMetaobjectPermissions() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: `${API_CONFIG.shop}.myshopify.com`,
      port: 443,
      path: `/admin/api/${API_CONFIG.apiVersion}/metaobject_definitions.json`,
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": API_CONFIG.accessToken,
      },
    };

    console.log("🔍 Test permissions metaobject_definitions...");

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        console.log(`Status: ${res.statusCode}`);
        console.log("Response:", data);

        if (res.statusCode === 200) {
          const definitions = JSON.parse(data);
          console.log(
            `✅ ${definitions.metaobject_definitions.length} definitions trouvées`
          );

          definitions.metaobject_definitions.forEach((def) => {
            console.log(`- Type: ${def.type}, ID: ${def.id}`);
          });

          resolve(definitions);
        } else {
          console.log("❌ Erreur permissions");
          reject(data);
        }
      });
    });

    req.on("error", reject);
    req.end();
  });
}

// Test création avec structure exacte
function testCorrectStructure() {
  return new Promise((resolve, reject) => {
    // Structure exacte basée sur la définition
    const postData = JSON.stringify({
      metaobject: {
        type: "colors",
        fields: [
          {
            key: "display_name",
            value: "Test Color Debug",
          },
          {
            key: "hex_value",
            value: "#FF0000",
          },
          {
            key: "css_name",
            value: "testred",
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

    console.log("\n🧪 Test structure correcte...");
    console.log("Data:", postData);

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        console.log(`Status: ${res.statusCode}`);
        console.log("Response:", data);
        resolve(res.statusCode === 201);
      });
    });

    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

async function main() {
  try {
    console.log("🔧 DEBUG PERMISSIONS & STRUCTURE");
    console.log("=================================");

    await testMetaobjectPermissions();
    await testCorrectStructure();
  } catch (error) {
    console.error("Erreur:", error);
  }
}

main();
