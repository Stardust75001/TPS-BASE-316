#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
try {
  require("dotenv").config();
} catch (e) {}

const ENVIRONMENTS = ["development", "staging", "production"];
const DEFAULT_ENV = "development";

function listEnvs() {
  console.log("Envs:");
  ENVIRONMENTS.forEach((e) => console.log("- " + e));
}

function loadEnv(env) {
  const file = `.env.${env}`;
  if (!fs.existsSync(file)) {
    console.error("No file", file);
    process.exit(1);
  }
  const content = fs.readFileSync(file, "utf8");
  fs.writeFileSync(".env", content, "utf8");
  console.log("Loaded", file);
}

const cmd = process.argv[2] || "list";
if (cmd === "list") listEnvs();
else if (cmd === "load") loadEnv(process.argv[3] || DEFAULT_ENV);
else if (cmd === "validate")
  console.log("validate not implemented in cjs shim");
else console.log("Usage: multi-env.cjs list|load <env>");
