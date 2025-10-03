#!/usr/bin/env node

/**
 * Export Pantone Color Metadata to CSV
 * Extracts data from existing JavaScript color mappings
 */

const fs = require("fs");
const path = require("path");

// Read the pantone colors from assets/product.js
function extractPantoneColorsFromProductJS() {
  try {
    const productJsPath = path.join(__dirname, "assets", "product.js");
    const content = fs.readFileSync(productJsPath, "utf8");

    // Extract the pantoneColors object
    const match = content.match(/const pantoneColors = \{([\s\S]*?)\};/);
    if (!match) {
      throw new Error("pantoneColors object not found in assets/product.js");
    }

    const pantoneColorsString = `{${match[1]}}`;
    const pantoneColors = eval("(" + pantoneColorsString + ")");

    return pantoneColors;
  } catch (error) {
    console.warn("Could not extract from product.js:", error.message);
    return {};
  }
}

// Read colors from existing CSV file
function extractFromExistingCSV() {
  try {
    const csvPath = path.join(__dirname, "pantone-colors-import.csv");
    const content = fs.readFileSync(csvPath, "utf8");
    const lines = content.split("\n");
    const colors = {};

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const [handle, code, name, hex] = line.split(",");
      if (handle && code && hex) {
        colors[code] = {
          handle: handle,
          code: code,
          name: name,
          hex: hex,
        };
      }
    }

    return colors;
  } catch (error) {
    console.warn("Could not read existing CSV:", error.message);
    return {};
  }
}

// Convert Pantone name to proper format
function formatPantoneName(code) {
  return code
    .replace(/^pantone-/, "PANTONE ")
    .replace(/-c$/, " C")
    .replace(/-u$/, " U")
    .replace(/-/, " ")
    .toUpperCase();
}

// Generate CSV content
function generateCSV(colors) {
  const header = "Handle,Code,Name,Hex,RGB,Description,Category\n";

  const rows = Object.entries(colors)
    .map(([code, data]) => {
      const handle = data.handle || code;
      const name = data.name || formatPantoneName(code);
      const hex = data.hex || "#000000";

      // Convert hex to RGB
      const rgb = hexToRgb(hex);
      const rgbString = rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : "";

      // Determine category based on code
      let category = "Standard";
      if (code.includes("cool-gray")) category = "Cool Gray";
      else if (code.includes("warm-gray")) category = "Warm Gray";
      else if (code.includes("process")) category = "Process Color";
      else if (code.match(/^\d+/)) category = "Numbered Series";

      const description = `Pantone Color ${name}`;

      return `"${handle}","${code}","${name}","${hex}","${rgbString}","${description}","${category}"`;
    })
    .join("\n");

  return header + rows;
}

// Helper function to convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Main function
function main() {
  console.log("🎨 Export Pantone Color Metadata to CSV\n");

  // Extract colors from multiple sources
  console.log("📄 Reading color data from multiple sources...");

  const jsColors = extractPantoneColorsFromProductJS();
  const csvColors = extractFromExistingCSV();

  // Merge colors (CSV takes priority)
  const allColors = { ...jsColors, ...csvColors };

  // Convert JS color object to consistent format
  const formattedColors = {};
  for (const [code, hex] of Object.entries(allColors)) {
    if (typeof hex === "string") {
      formattedColors[code] = {
        handle: code,
        code: code,
        name: formatPantoneName(code),
        hex: hex,
      };
    } else if (typeof hex === "object") {
      formattedColors[code] = hex;
    }
  }

  console.log(`✅ Found ${Object.keys(formattedColors).length} Pantone colors`);

  // Generate CSV
  const csvContent = generateCSV(formattedColors);

  // Write to file
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, "");
  const filename = `pantone-colors-export-${timestamp}.csv`;

  fs.writeFileSync(filename, csvContent);

  console.log(`\n🎉 Export completed successfully!`);
  console.log(`📁 File created: ${filename}`);
  console.log(
    `📊 Total colors exported: ${Object.keys(formattedColors).length}`
  );

  // Show preview of first few rows
  console.log("\n📋 Preview (first 5 rows):");
  const lines = csvContent.split("\n");
  for (let i = 0; i < Math.min(6, lines.length); i++) {
    console.log(lines[i]);
  }

  return filename;
}

// Export for use as module
module.exports = {
  main,
  extractPantoneColorsFromProductJS,
  extractFromExistingCSV,
};

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
