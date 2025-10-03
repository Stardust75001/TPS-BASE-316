#!/usr/bin/env node

const fs = require("fs");

console.log("🎨 Simple Pantone CSV Export");

// Read from existing pantone-colors-import.csv
const csvPath = "pantone-colors-import.csv";

if (!fs.existsSync(csvPath)) {
  console.error("❌ File not found:", csvPath);
  process.exit(1);
}

const content = fs.readFileSync(csvPath, "utf8");
const lines = content.split("\n");

console.log("✅ Read", lines.length, "lines from", csvPath);

// Enhanced CSV with additional metadata columns
const header = "Handle,Code,Name,Hex,RGB,HSL,Category,Description,Created\n";

let rows = [];
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  const [handle, code, name, hex] = line.split(",");
  if (!handle || !hex) continue;

  // Convert hex to RGB and HSL
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const rgbString = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
  const hslString = `hsl(${Math.round(hsl.h)},${Math.round(
    hsl.s
  )}%,${Math.round(hsl.l)}%)`;

  // Determine category
  let category = "Standard";
  if (code.includes("cool-gray")) category = "Cool Gray";
  else if (code.includes("warm-gray")) category = "Warm Gray";
  else if (code.includes("process")) category = "Process Color";
  else if (code.match(/-\d+-/)) category = "Numbered Series";

  const description = `Pantone Color ${name.replace(/"/g, "")}`;
  const created = new Date().toISOString();

  const row = `"${handle}","${code}","${name}","${hex}","${rgbString}","${hslString}","${category}","${description}","${created}"`;
  rows.push(row);
}

const csvContent = header + rows.join("\n");

// Write to file
const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, "");
const filename = `pantone-metadata-export-${timestamp}.csv`;

fs.writeFileSync(filename, csvContent);

console.log("🎉 Export completed!");
console.log("📁 File:", filename);
console.log("📊 Rows:", rows.length);

// Show preview
console.log("\n📋 Preview:");
console.log(csvContent.split("\n").slice(0, 6).join("\n"));

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}
