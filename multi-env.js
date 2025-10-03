#!/usr/bin/env node

/**
 * Multi-Environment Analytics Manager
 * Gère les configurations analytics pour différents environnements
 */

const fs = require("fs");
const path = require("path");

// Charger dotenv
try {
  require("dotenv").config();
} catch (e) {
  console.warn("dotenv non installé");
}

const ENVIRONMENTS = ["development", "staging", "production"];
const DEFAULT_ENV = "development";

class MultiEnvManager {
  constructor() {
    this.currentEnv = process.env.NODE_ENV || DEFAULT_ENV;
    this.envFile = `.env.${this.currentEnv}`;
  }

  /**
   * Lister les environnements disponibles
   */
  listEnvironments() {
    console.log("🌍 Environnements disponibles :");
    ENVIRONMENTS.forEach((env) => {
      const exists = fs.existsSync(`.env.${env}`);
      const current = env === this.currentEnv ? " (ACTUEL)" : "";
      const status = exists ? "✅" : "❌";
      console.log(`   ${status} ${env}${current}`);
    });
  }

  /**
   * Charger la configuration d'un environnement
   */
  loadEnvironment(env = null) {
    const targetEnv = env || this.currentEnv;
    const envFile = `.env.${targetEnv}`;

    if (!fs.existsSync(envFile)) {
      console.error(`❌ Fichier d'environnement introuvable: ${envFile}`);
      return false;
    }

    // Copier vers .env principal
    fs.copyFileSync(envFile, ".env");
    console.log(`✅ Configuration chargée depuis ${envFile}`);

    this.showCurrentConfig();
    return true;
  }

  /**
   * Afficher la configuration actuelle
   */
  showCurrentConfig() {
    console.log("\n📋 Configuration actuelle :");
    const envContent = fs.readFileSync(".env", "utf8");

    // Extraire les IDs principaux
    const gtmMatch = envContent.match(/GTM_CONTAINER_ID=(.+)/);
    const ga4Match = envContent.match(/GA4_MEASUREMENT_ID=(.+)/);
    const fbMatch = envContent.match(/FACEBOOK_PIXEL_ID=(.+)/);
    const nodeEnvMatch = envContent.match(/NODE_ENV=(.+)/);

    if (nodeEnvMatch) console.log(`   Environnement: ${nodeEnvMatch[1]}`);
    if (gtmMatch) console.log(`   GTM: ${gtmMatch[1]}`);
    if (ga4Match) console.log(`   GA4: ${ga4Match[1]}`);
    if (fbMatch) console.log(`   Facebook Pixel: ${fbMatch[1]}`);
  }

  /**
   * Créer un nouvel environnement
   */
  createEnvironment(env) {
    const envFile = `.env.${env}`;

    if (fs.existsSync(envFile)) {
      console.log(`⚠️  L'environnement ${env} existe déjà`);
      return false;
    }

    // Copier le template de développement
    const template = fs.existsSync(".env.development")
      ? ".env.development"
      : ".env.example";
    fs.copyFileSync(template, envFile);

    console.log(`✅ Environnement ${env} créé depuis ${template}`);
    console.log(`   Modifiez ${envFile} avec vos valeurs spécifiques`);
    return true;
  }

  /**
   * Valider toutes les configurations
   */
  validateAll() {
    console.log("🔍 Validation de tous les environnements :");

    ENVIRONMENTS.forEach((env) => {
      const envFile = `.env.${env}`;
      if (fs.existsSync(envFile)) {
        console.log(`\n📁 ${env.toUpperCase()}:`);
        this.validateEnvFile(envFile);
      }
    });
  }

  /**
   * Valider un fichier d'environnement
   */
  validateEnvFile(file) {
    const content = fs.readFileSync(file, "utf8");
    const errors = [];
    const warnings = [];

    // Vérifications
    const gtmMatch = content.match(/GTM_CONTAINER_ID=(.+)/);
    const ga4Match = content.match(/GA4_MEASUREMENT_ID=(.+)/);
    const fbMatch = content.match(/FACEBOOK_PIXEL_ID=(.+)/);

    if (gtmMatch && !gtmMatch[1].match(/^GTM-[A-Z0-9]+$/)) {
      errors.push(`GTM ID invalide: ${gtmMatch[1]}`);
    }

    if (ga4Match && !ga4Match[1].match(/^G-[A-Z0-9]+$/)) {
      errors.push(`GA4 ID invalide: ${ga4Match[1]}`);
    }

    if (fbMatch && !fbMatch[1].match(/^\d{15,16}$/)) {
      errors.push(`Facebook Pixel invalide: ${fbMatch[1]}`);
    }

    // Affichage
    if (errors.length > 0) {
      console.log("   ❌ Erreurs:", errors.join(", "));
    } else {
      console.log("   ✅ Configuration valide");
    }

    if (warnings.length > 0) {
      console.log("   ⚠️  Avertissements:", warnings.join(", "));
    }
  }

  /**
   * Synchroniser les outils webmaster entre environnements
   */
  syncWebmasterTools() {
    console.log("🔄 Synchronisation des outils webmaster...");

    // Lire les codes de vérification depuis production
    const prodFile = ".env.production";
    if (!fs.existsSync(prodFile)) {
      console.log("❌ Fichier production introuvable");
      return;
    }

    const prodContent = fs.readFileSync(prodFile, "utf8");
    const googleVerif = prodContent.match(/GOOGLE_SITE_VERIFICATION=(.+)/);
    const ahrefsVerif = prodContent.match(/AHREFS_SITE_VERIFICATION=(.+)/);

    // Appliquer à tous les environnements
    ENVIRONMENTS.forEach((env) => {
      const envFile = `.env.${env}`;
      if (fs.existsSync(envFile)) {
        let content = fs.readFileSync(envFile, "utf8");

        if (googleVerif) {
          content = content.replace(
            /GOOGLE_SITE_VERIFICATION=.+/,
            `GOOGLE_SITE_VERIFICATION=${googleVerif[1]}`
          );
        }
        if (ahrefsVerif) {
          content = content.replace(
            /AHREFS_SITE_VERIFICATION=.+/,
            `AHREFS_SITE_VERIFICATION=${ahrefsVerif[1]}`
          );
        }

        fs.writeFileSync(envFile, content);
        console.log(`   ✅ ${env} synchronisé`);
      }
    });
  }
}

// CLI
const manager = new MultiEnvManager();
const command = process.argv[2];
const arg = process.argv[3];

switch (command) {
  case "list":
    manager.listEnvironments();
    break;

  case "load":
    manager.loadEnvironment(arg);
    break;

  case "create":
    if (!arg) {
      console.log("Usage: node multi-env.js create <nom_environnement>");
      process.exit(1);
    }
    manager.createEnvironment(arg);
    break;

  case "validate":
    manager.validateAll();
    break;

  case "sync":
    manager.syncWebmasterTools();
    break;

  case "show":
    manager.showCurrentConfig();
    break;

  default:
    console.log(`
Multi-Environment Analytics Manager

Usage:
  node multi-env.js <command> [args]

Commands:
  list                    Lister les environnements
  load <env>             Charger un environnement
  create <env>           Créer un nouvel environnement
  validate               Valider tous les environnements
  sync                   Synchroniser les webmaster tools
  show                   Afficher la config actuelle

Exemples:
  node multi-env.js list
  node multi-env.js load production
  node multi-env.js create staging
  node multi-env.js validate
`);
}
