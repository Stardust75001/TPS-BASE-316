#!/usr/bin/env node
try {
  require("dotenv").config();
} catch (e) {}
const metaPixelId = process.env.FACEBOOK_PIXEL_ID;
const expectedId = "1973238620087976";
console.log("Current FB Pixel:", metaPixelId || "NONE");
if (metaPixelId === expectedId) console.log("✅ Meta Pixel correct");
else {
  console.error("❌ Meta Pixel mismatch - expected", expectedId);
  process.exit(1);
}
