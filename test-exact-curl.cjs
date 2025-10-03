#!/usr/bin/env node

/**
 * REPRODUCTION EXACTE CURL
 * Copie parfaite de la requête curl qui fonctionne
 */

const https = require("https");

// Test ULTRA SIMPLIFIÉ - reproduction exacte du curl
function testExactCurl() {
  return new Promise((resolve, reject) => {
    // EXACTEMENT le même JSON que curl
    const postData =
      '{"metaobject":{"type":"colors","fields":[{"key":"display_name","value":"Aliceblue"},{"key":"hex_value","value":"#F0F8FF"},{"key":"css_name","value":"aliceblue"}]}}';

    const options = {
      hostname: "f6d72e-0f.myshopify.com",
      port: 443,
      path: "/admin/api/2025-01/metaobjects.json",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": "shpat_REDACTED",
        "Content-Length": postData.length,
        "User-Agent": "node-test",
        Accept: "*/*",
        Host: "f6d72e-0f.myshopify.com",
      },
    };

    console.log("🔍 TEST REPRODUCTION EXACTE CURL");
    console.log("===============================");
    console.log("URL:", `https://${options.hostname}${options.path}`);
    console.log("Method:", options.method);
    console.log("Headers:", JSON.stringify(options.headers, null, 2));
    console.log("Body length:", postData.length);
    console.log("Body:", postData);
    console.log("");

    const req = https.request(options, (res) => {
      let data = "";

      console.log("📊 RÉPONSE:");
      console.log("Status:", res.statusCode, res.statusMessage);
      console.log("Headers:", JSON.stringify(res.headers, null, 2));

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        console.log("Body length:", data.length);
        console.log("Body:", data);

        if (res.statusCode === 201) {
          console.log("✅ SUCCÈS !");
          resolve(true);
        } else {
          console.log("❌ ÉCHEC !");

          // Analyser l'erreur 406 en détail
          if (res.statusCode === 406) {
            console.log("");
            console.log("🔍 ANALYSE 406:");
            console.log(
              "- Content-Type response:",
              res.headers["content-type"]
            );
            console.log("- Body vide?", data.length === 0);

            if (data.length > 0) {
              try {
                const parsed = JSON.parse(data);
                console.log("- JSON parsé:", JSON.stringify(parsed, null, 2));
              } catch (e) {
                console.log("- Body non-JSON:", data);
              }
            }
          }

          resolve(false);
        }
      });
    });

    req.on("error", (error) => {
      console.error("💥 Erreur requête:", error);
      reject(error);
    });

    // Envoyer exactement le même body que curl
    req.write(postData);
    req.end();
  });
}

// Test avec différentes variations
async function testVariations() {
  console.log("🧪 TESTS DE VARIATIONS");
  console.log("=====================");

  // Test 1: Reproduction exacte
  console.log("\n🔬 Test 1: Reproduction exacte curl...");
  const result1 = await testExactCurl();

  if (result1) {
    console.log("🎉 PROBLÈME RÉSOLU ! Node.js fonctionne maintenant");
    return true;
  }

  // Si ça échoue, le problème est ailleurs
  console.log("\n🤔 Node.js échoue là où curl réussit...");
  console.log("Le problème peut être:");
  console.log("1. HTTP/2 vs HTTP/1.1");
  console.log("2. TLS/SSL différent");
  console.log("3. Headers automatiques Node.js");
  console.log("4. Encoding différent");

  return false;
}

// Lancement
testVariations().catch(console.error);
