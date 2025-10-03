#!/usr/bin/env node
/*
  validate-hybrid.js
  Scans Liquid theme files for disallowed <script src> pointing to theme assets.
  Allowed direct loads: asset-fallbacks.js, hybrid-script-loader-v3.js, base.js
  Always allowed: shopify_asset_url and external origins.
*/

const fs = require("fs");
const path = require("path");
const glob = require("glob");

const root = process.cwd();
const globs = [
  "layout/**/*.liquid",
  "sections/**/*.liquid",
  "snippets/**/*.liquid",
  "templates/**/*.liquid",
];

const allowedFiles = new Set([
  "asset-fallbacks.js",
  "hybrid-script-loader-v3.js",
  "base.js",
]);

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function findMatches(content) {
  const lines = content.split(/\r?\n/);
  const violations = [];
  const findings = {
    totalScriptSrc: 0,
    shopifyCore: 0,
    external: 0,
    allowedThemeDirect: 0,
    disallowedThemeDirect: 0,
    dataHybrid: 0,
  };

  // Quick counts
  findings.dataHybrid = (
    content.match(/<script[^>]*\bdata-hybrid-src=\s*"[^"]+"/gi) || []
  ).length;

  // Walk lines to get line numbers
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Count any script src
    const scriptSrcMatches =
      line.match(/<script[^>]*\bsrc\s*=\s*"[^"]+"[^>]*>/gi) || [];
    if (scriptSrcMatches.length)
      findings.totalScriptSrc += scriptSrcMatches.length;

    for (const tag of scriptSrcMatches) {
      // shopify core assets are always allowed
      if (/\|\s*shopify_asset_url/.test(tag)) {
        findings.shopifyCore++;
        continue;
      }

      // External origins (non-Shopify CDN or any http(s) except Shopify theme CDN)
      const mHttp = tag.match(/src\s*=\s*"(https?:\/\/[^\"]+)"/i);
      if (mHttp) {
        const url = mHttp[1];
        const isThemeCdn =
          /https?:\/\/cdn\.shopify\.com\/.*\/assets\//i.test(url) ||
          /\/cdn\/shop\/t\//i.test(url);
        if (!isThemeCdn) {
          findings.external++;
          continue; // external scripts OK
        }
        // Shopify theme CDN: check filename against allow-list
        const fname = (
          url.split("?")[0].split("#")[0].split("/").pop() || ""
        ).toLowerCase();
        if (allowedFiles.has(fname)) {
          findings.allowedThemeDirect++;
        } else {
          findings.disallowedThemeDirect++;
          violations.push({
            type: "cdn-theme",
            line: i + 1,
            tag,
            src: url,
            filename: fname,
          });
        }
        continue;
      }

      // Liquid theme asset via asset_url inside src
      if (/\|\s*asset_url/.test(tag)) {
        // Extract filename if present
        const inner = tag.match(
          /\{\{\s*['\"]([^'\"]+\.js)['\"]\s*\|\s*asset_url/i
        );
        const fname = inner ? inner[1].toLowerCase() : null;
        if (fname && allowedFiles.has(fname)) {
          findings.allowedThemeDirect++;
        } else {
          findings.disallowedThemeDirect++;
          violations.push({
            type: "liquid-asset",
            line: i + 1,
            tag,
            src: "asset_url",
            filename: fname || "(dynamic)",
          });
        }
        continue;
      }

      // Any other script src we haven't classified (relative paths etc.) → treat as external/ok
      findings.external++;
    }
  }

  return { violations, findings };
}

function run() {
  const files = globs.flatMap((g) =>
    glob.sync(g, { cwd: root, nodir: true, dot: false })
  );
  let totalViolations = 0;
  const allViolations = [];
  const totals = {
    files: files.length,
    totalScriptSrc: 0,
    shopifyCore: 0,
    external: 0,
    allowedThemeDirect: 0,
    disallowedThemeDirect: 0,
    dataHybrid: 0,
  };

  for (const rel of files) {
    const abs = path.join(root, rel);
    const content = read(abs);
    const { violations, findings } = findMatches(content);

    totals.totalScriptSrc += findings.totalScriptSrc;
    totals.shopifyCore += findings.shopifyCore;
    totals.external += findings.external;
    totals.allowedThemeDirect += findings.allowedThemeDirect;
    totals.disallowedThemeDirect += findings.disallowedThemeDirect;
    totals.dataHybrid += findings.dataHybrid;

    if (violations.length) {
      totalViolations += violations.length;
      allViolations.push({ file: rel, violations });
    }
  }

  if (allViolations.length) {
    console.log(
      "Hybrid Validator: DISALLOWED <script src> found for theme assets"
    );
    for (const entry of allViolations) {
      console.log(`\nFile: ${entry.file}`);
      for (const v of entry.violations) {
        console.log(`  Line ${v.line}: ${v.type} → ${v.filename || ""}`);
        console.log(`  Src: ${v.src}`);
        console.log(`  Tag: ${v.tag.trim()}`);
      }
    }
  } else {
    console.log(
      "Hybrid Validator: No disallowed <script src> to theme assets found."
    );
  }

  console.log("\nSummary:");
  console.log(`  Files scanned: ${totals.files}`);
  console.log(`  <script src> tags: ${totals.totalScriptSrc}`);
  console.log(`  shopify_asset_url (allowed): ${totals.shopifyCore}`);
  console.log(`  External origins (allowed): ${totals.external}`);
  console.log(`  Allowed theme direct: ${totals.allowedThemeDirect}`);
  console.log(`  Disallowed theme direct: ${totals.disallowedThemeDirect}`);
  console.log(`  data-hybrid-src tags (info): ${totals.dataHybrid}`);

  if (totalViolations > 0) {
    process.exitCode = 2;
  }
}

run();
