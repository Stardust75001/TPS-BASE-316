const https = require("https");
const fs = require("fs");
const readline = require("readline");

const TOKEN = "shpat_REDACTED";
const SHOP = "f6d72e-0f";
const API_VERSION = "2025-01";
const CSV_FILE = "css-colors-import.csv";

// Fonction pour faire des requêtes HTTPS
function makeRequest(options, data = null) {
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

    req.on("error", (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Fonction pour créer un metaobject couleur
async function createColor(name, hex, cssName) {
  const options = {
    hostname: `${SHOP}.myshopify.com`,
    port: 443,
    path: `/admin/api/${API_VERSION}/metaobjects.json`,
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": TOKEN,
      "Content-Type": "application/json",
    },
  };

  const payload = {
    metaobject: {
      type: "colors",
      fields: {
        display_name: name,
        hex_value: hex,
        css_name: cssName,
      },
    },
  };

  return await makeRequest(options, payload);
}

// Fonction pour parser le CSV
function parseCSV() {
  return new Promise((resolve, reject) => {
    const colors = [];

    if (!fs.existsSync(CSV_FILE)) {
      reject(new Error(`Fichier CSV non trouvé: ${CSV_FILE}`));
      return;
    }

    const rl = readline.createInterface({
      input: fs.createReadStream(CSV_FILE),
      crlfDelay: Infinity,
    });

    let isFirstLine = true;

    rl.on("line", (line) => {
      if (isFirstLine) {
        isFirstLine = false;
        return; // Skip header
      }

      // Parse CSV line
      const parts = line
        .split(",")
        .map((part) => part.replace(/^"(.*)"$/, "$1").trim());

      if (parts.length >= 3) {
        colors.push({
          name: parts[0],
          hex: parts[1],
          code: parts[2],
        });
      }
    });

    rl.on("close", () => {
      resolve(colors);
    });

    rl.on("error", reject);
  });
}

// Fonction pour attendre (rate limiting)
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function importColors() {
  console.log("🌈 IMPORT COULEURS CSS - NODE.JS");
  console.log("=================================");
  console.log(`📅 ${new Date().toLocaleString()}`);
  console.log("");

  let colors;
  try {
    colors = await parseCSV();
    console.log(`📊 ${colors.length} couleurs trouvées dans le CSV`);
  } catch (error) {
    console.error("❌ Erreur lecture CSV:", error.message);
    process.exit(1);
  }

  let success = 0;
  let errors = 0;
  let duplicates = 0;

  console.log("");
  console.log("🚀 Début de l'import...");
  console.log("");

  for (let i = 0; i < colors.length; i++) {
    const color = colors[i];
    const progress = `[${i + 1}/${colors.length}]`;

    process.stdout.write(
      `${progress} ${color.name.padEnd(20)} ${color.hex} ... `
    );

    try {
      const result = await createColor(color.name, color.hex, color.code);

      if (result.statusCode === 201) {
        console.log("✅ OK");
        success++;
      } else if (result.statusCode === 422) {
        // Vérifier si c'est un duplicata
        const errorText = JSON.stringify(result.data).toLowerCase();
        if (
          errorText.includes("already exists") ||
          errorText.includes("duplicate")
        ) {
          console.log("⚠️  EXISTE DÉJÀ");
          duplicates++;
        } else {
          console.log("❌ VALIDATION");
          console.log(
            `    Erreur: ${result.data.errors || JSON.stringify(result.data)}`
          );
          errors++;
        }
      } else if (result.statusCode === 429) {
        console.log("⏳ RATE LIMIT");
        console.log("    Pause 30s...");
        await delay(30000);

        // Retry une fois
        const retryResult = await createColor(
          color.name,
          color.hex,
          color.code
        );
        if (retryResult.statusCode === 201) {
          console.log("    ✅ OK (retry)");
          success++;
        } else {
          console.log(`    ❌ ÉCHEC (${retryResult.statusCode})`);
          errors++;
        }
      } else {
        console.log(`❌ HTTP ${result.statusCode}`);
        console.log(`    ${JSON.stringify(result.data)}`);
        errors++;
      }
    } catch (error) {
      console.log(`❌ ERREUR: ${error.message}`);
      errors++;
    }

    // Rate limiting léger
    await delay(1000);
  }

  console.log("");
  console.log("=== RÉSULTAT FINAL ===");
  console.log(`✅ Succès: ${success}`);
  console.log(`⚠️  Duplicatas: ${duplicates}`);
  console.log(`❌ Erreurs: ${errors}`);
  console.log(`📊 Total: ${colors.length}`);

  const totalSuccess = success + duplicates;

  if (errors === 0) {
    console.log("");
    console.log("🎉 IMPORT TERMINÉ AVEC SUCCÈS !");
    console.log(
      `Toutes les ${totalSuccess} couleurs sont maintenant disponibles dans Shopify`
    );
  } else {
    console.log("");
    console.log(`⚠️  Import terminé avec ${errors} erreurs`);
    console.log(
      `${totalSuccess}/${colors.length} couleurs importées avec succès`
    );
  }
}

// Lancer l'import
importColors().catch((error) => {
  console.error("❌ Erreur fatale:", error);
  process.exit(1);
});
