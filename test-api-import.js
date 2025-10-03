#!/usr/bin/env node

/**
 * TEST RAPIDE API SHOPIFY
 * Test avec votre token directement
 */

const fs = require("fs");
const https = require("https");

// Configuration avec votre token
const API_CONFIG = {
  shop: "f6d72e-0f",
  accessToken: "shpat_REDACTED",
  apiVersion: "2023-10",
};

// Test de connexion
function testConnection() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: `${API_CONFIG.shop}.myshopify.com`,
      port: 443,
      path: `/admin/api/${API_CONFIG.apiVersion}/shop.json`,
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": API_CONFIG.accessToken,
      },
    };

    console.log("🔍 Test de connexion API...");
    console.log(
      `📍 URL: https://${API_CONFIG.shop}.myshopify.com/admin/api/${API_CONFIG.apiVersion}/shop.json`
    );

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        console.log(`📊 Status Code: ${res.statusCode}`);
        console.log(`📋 Response Headers:`, res.headers);

        if (res.statusCode === 200) {
          try {
            const shop = JSON.parse(data).shop;
            console.log("✅ CONNEXION RÉUSSIE !");
            console.log(`🏪 Shop: ${shop.name}`);
            console.log(`🌐 Domain: ${shop.domain}`);
            resolve(true);
          } catch (e) {
            console.log("❌ Erreur parsing:", e.message);
            console.log("📄 Raw data:", data);
            reject(false);
          }
        } else {
          console.log("❌ ERREUR CONNEXION");
          console.log("📄 Response:", data);
          reject(false);
        }
      });
    });

    req.on("error", (error) => {
      console.log("❌ Request Error:", error.message);
      reject(error);
    });

    req.end();
  });
}

// Test création d'un metaobject
function testCreateMetaobject() {
  return new Promise((resolve, reject) => {
    const testColor = {
      name: "Test Red",
      hex: "#FF0000",
      code: "red",
    };

    const postData = JSON.stringify({
      metaobject: {
        type: "colors",
        fields: {
          display_name: testColor.name,
          hex_value: testColor.hex,
          css_name: testColor.code,
        },
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

    console.log("\n🧪 Test création metaobject...");
    console.log("📤 Data:", postData);

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        console.log(`📊 Status Code: ${res.statusCode}`);
        console.log("📄 Response:", data);

        if (res.statusCode === 201) {
          console.log("✅ METAOBJECT CRÉÉ !");
          resolve(true);
        } else {
          console.log("❌ ERREUR CRÉATION");
          reject(false);
        }
      });
    });

    req.on("error", (error) => {
      console.log("❌ Request Error:", error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Lister les metaobjects existants
function listMetaobjects() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: `${API_CONFIG.shop}.myshopify.com`,
      port: 443,
      path: `/admin/api/${API_CONFIG.apiVersion}/metaobjects.json?type=colors&limit=10`,
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": API_CONFIG.accessToken,
      },
    };

    console.log("\n📋 Liste des metaobjects colors...");

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        console.log(`📊 Status Code: ${res.statusCode}`);

        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            console.log(
              `✅ ${
                response.metaobjects ? response.metaobjects.length : 0
              } metaobjects trouvés`
            );
            if (response.metaobjects) {
              response.metaobjects.forEach((obj, i) => {
                console.log(`  ${i + 1}. ID: ${obj.id}, Handle: ${obj.handle}`);
              });
            }
            resolve(true);
          } catch (e) {
            console.log("❌ Erreur parsing:", e.message);
            console.log("📄 Raw data:", data);
            reject(false);
          }
        } else {
          console.log("❌ ERREUR LISTING");
          console.log("📄 Response:", data);
          reject(false);
        }
      });
    });

    req.on("error", (error) => {
      console.log("❌ Request Error:", error.message);
      reject(error);
    });

    req.end();
  });
}

// Main
async function main() {
  try {
    console.log("🧪 TEST API SHOPIFY METAOBJECTS");
    console.log("================================");

    // Test 1: Connexion
    await testConnection();

    // Test 2: Lister les metaobjects
    await listMetaobjects();

    // Test 3: Créer un metaobject (optionnel)
    const args = process.argv.slice(2);
    if (args.includes("--create")) {
      await testCreateMetaobject();
    } else {
      console.log(
        "\n💡 Pour tester la création: node test-api-import.js --create"
      );
    }

    console.log("\n🎉 Tests terminés !");
  } catch (error) {
    console.error("💥 Erreur:", error);
    process.exit(1);
  }
}

main();
