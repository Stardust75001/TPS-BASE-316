#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function walk(dir) {
  const results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const d of list) {
    if (d.name === "node_modules" || d.name === ".git") continue;
    const full = path.join(dir, d.name);
    if (d.isDirectory()) results.push(...walk(full));
    else results.push(full);
  }
  return results;
}

function flatten(obj, prefix = "") {
  let keys = [];
  for (const k of Object.keys(obj)) {
    const val = obj[k];
    const key = prefix ? `${prefix}.${k}` : k;
    if (val && typeof val === "object" && !Array.isArray(val)) {
      keys = keys.concat(flatten(val, key));
    } else {
      keys.push(key);
    }
  }
  return keys;
}

function extractKeysFromContent(content) {
  const keys = new Set();
  // matches 'some.key' | t and "some.key" | t
  const re1 = /['"]([a-z0-9_\.\-]+)['"]\s*\|\s*t/gim;
  let m;
  while ((m = re1.exec(content))) keys.add(m[1]);

  // matches t 'some.key' (rare)
  const re2 = /t\s*[:]\s*['"]([a-z0-9_\.\-]+)['"]/gim;
  while ((m = re2.exec(content))) keys.add(m[1]);

  // matches {{ 'key' | t: ... }} with parameters already handled by re1
  return Array.from(keys);
}

function main() {
  const files = walk(root);
  const scanExts = [".liquid", ".json", ".html", ".js"];
  const targetFiles = files.filter((f) =>
    scanExts.includes(path.extname(f).toLowerCase())
  );

  const referenced = new Set();
  for (const f of targetFiles) {
    try {
      const c = fs.readFileSync(f, "utf8");
      const keys = extractKeysFromContent(c);
      keys.forEach((k) => referenced.add(k));
    } catch (e) {
      // ignore read errors
    }
  }

  const localePath = path.join(root, "locales", "fr.json");
  if (!fs.existsSync(localePath)) {
    console.error("Could not find locales/fr.json at", localePath);
    process.exit(2);
  }
  let localeObj;
  try {
    const raw = fs.readFileSync(localePath, "utf8");
    localeObj = JSON.parse(raw);
  } catch (e) {
    console.error("Failed to read/parse locales/fr.json:", e.message);
    process.exit(2);
  }

  const available = new Set(flatten(localeObj));

  const missing = [];
  for (const k of Array.from(referenced).sort()) {
    if (!available.has(k)) missing.push(k);
  }

  // Filter out obviously non-i18n keys (like 'now' or date formats) - keep minimal filtering
  const filtered = missing.filter((k) => !/^now$/.test(k));

  console.log("Referenced keys count:", referenced.size);
  console.log("Available fr.json keys count:", available.size);
  console.log("Missing keys count:", filtered.length);
  if (filtered.length) {
    console.log("\nMissing keys:");
    for (const k of filtered) console.log(k);
  } else {
    console.log("\nNo missing keys found (for keys matched by simple parser).");
  }
}

main();
