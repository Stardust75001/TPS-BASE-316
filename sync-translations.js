#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Fichier de référence (anglais)
const enFile = path.join(__dirname, "locales/en.default.json");
const enData = JSON.parse(fs.readFileSync(enFile, "utf8"));

// Traductions pour les nouvelles clés
const translations = {
  fr: {
    "general.accessibility.close": "Fermer",
    "general.policy.title": "Politique",
    "general.policy.default_content":
      "Cette page contient la politique de notre boutique.",
    "general.policy.last_updated": "Dernière mise à jour : {{ date }}",
    "product.price_unit": "Prix unitaire",
    "customer.login.password": "Mot de passe",
    "customer.login.forgot_password": "Mot de passe oublié ?",
    "customer.login.submit": "Se connecter",
    "customer.login.new": "Nouveau client ?",
    "customer.login.create_account": "Créer un compte",
    "customer.login.email": "Email",
    "customer.recover_password.title": "Réinitialiser votre mot de passe",
    "customer.recover_password.success":
      "Nous vous avons envoyé un lien de réinitialisation de mot de passe.",
    "customer.recover_password.subtext":
      "Entrez l'email associé à votre compte.",
    "customer.recover_password.submit": "Envoyer le lien de réinitialisation",
    "customer.register.title": "Créer un compte",
    "customer.register.first_name": "Prénom",
    "customer.register.last_name": "Nom",
    "customer.register.email": "Email",
    "customer.register.password": "Mot de passe",
    "customer.register.submit": "Créer",
    "customer.register.have_account": "Vous avez déjà un compte ?",
    "customer.register.login": "Se connecter",
    "customer.reset_password.title": "Réinitialiser votre mot de passe",
    "customer.reset_password.subtext":
      "Réinitialiser le mot de passe pour {{ email }}",
    "customer.reset_password.password": "Nouveau mot de passe",
    "customer.reset_password.password_confirm": "Confirmer le mot de passe",
    "customer.reset_password.submit": "Réinitialiser le mot de passe",
    "customer.order.title": "Commande {{ name }}",
    "customer.order.date_html": "Passée le {{ date }}",
    "customer.order.cancelled_html": "Commande annulée le {{ date }}",
    "customer.order.cancelled_reason": "Raison : {{ reason }}",
    "customer.order.product": "Produit",
    "customer.order.sku": "SKU",
    "customer.order.price": "Prix",
    "customer.order.quantity": "Qté",
    "customer.order.total": "Total",
    "customer.order.discount": "Remise",
    "customer.order.shipping": "Livraison",
    "customer.order.tax": "Taxe",
    "customer.order.subtotal": "Sous-total",
    "customer.order.billing_address": "Adresse de facturation",
    "customer.order.shipping_address": "Adresse de livraison",
    "customer.order.payment_status": "Statut de paiement",
    "customer.order.fulfillment_status": "Statut de traitement",
    "customer.order.track_shipment": "Suivre l'expédition",
  },
  de: {
    "general.accessibility.close": "Schließen",
    "general.policy.title": "Richtlinie",
    "general.policy.default_content":
      "Diese Seite enthält unsere Shop-Richtlinie.",
    "general.policy.last_updated": "Zuletzt aktualisiert: {{ date }}",
    "product.price_unit": "Stückpreis",
    "customer.login.password": "Passwort",
    "customer.login.forgot_password": "Passwort vergessen?",
    "customer.login.submit": "Anmelden",
    "customer.login.new": "Neuer Kunde?",
    "customer.login.create_account": "Konto erstellen",
    "customer.login.email": "E-Mail",
    "customer.recover_password.title": "Passwort zurücksetzen",
    "customer.recover_password.success":
      "Wir haben Ihnen einen Link zum Zurücksetzen des Passworts gesendet.",
    "customer.recover_password.subtext":
      "Geben Sie die mit Ihrem Konto verknüpfte E-Mail ein.",
    "customer.recover_password.submit": "Reset-Link senden",
    "customer.register.title": "Konto erstellen",
    "customer.register.first_name": "Vorname",
    "customer.register.last_name": "Nachname",
    "customer.register.email": "E-Mail",
    "customer.register.password": "Passwort",
    "customer.register.submit": "Erstellen",
    "customer.register.have_account": "Bereits ein Konto?",
    "customer.register.login": "Anmelden",
    "customer.reset_password.title": "Passwort zurücksetzen",
    "customer.reset_password.subtext": "Passwort für {{ email }} zurücksetzen",
    "customer.reset_password.password": "Neues Passwort",
    "customer.reset_password.password_confirm": "Passwort bestätigen",
    "customer.reset_password.submit": "Passwort zurücksetzen",
    "customer.order.title": "Bestellung {{ name }}",
    "customer.order.date_html": "Aufgegeben am {{ date }}",
    "customer.order.cancelled_html": "Bestellung storniert am {{ date }}",
    "customer.order.cancelled_reason": "Grund: {{ reason }}",
    "customer.order.product": "Produkt",
    "customer.order.sku": "SKU",
    "customer.order.price": "Preis",
    "customer.order.quantity": "Menge",
    "customer.order.total": "Gesamt",
    "customer.order.discount": "Rabatt",
    "customer.order.shipping": "Versand",
    "customer.order.tax": "Steuer",
    "customer.order.subtotal": "Zwischensumme",
    "customer.order.billing_address": "Rechnungsadresse",
    "customer.order.shipping_address": "Lieferadresse",
    "customer.order.payment_status": "Zahlungsstatus",
    "customer.order.fulfillment_status": "Erfüllungsstatus",
    "customer.order.track_shipment": "Sendung verfolgen",
  },
};

// Fonction pour obtenir une valeur nested
function getNestedValue(obj, path) {
  return path.split(".").reduce((current, key) => current && current[key], obj);
}

// Fonction pour définir une valeur nested
function setNestedValue(obj, path, value) {
  const keys = path.split(".");
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
}

// Fonction pour extraire toutes les clés du fichier anglais
function extractKeys(obj, prefix = "") {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      keys.push(...extractKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

// Traiter chaque fichier de langue
const localesDir = path.join(__dirname, "locales");
const files = fs
  .readdirSync(localesDir)
  .filter(
    (file) =>
      file.endsWith(".json") &&
      file !== "en.default.json" &&
      file !== "en.default.schema.json"
  );

const allKeys = extractKeys(enData);

files.forEach((file) => {
  const langCode = file.replace(".json", "");
  const filePath = path.join(localesDir, file);

  console.log(`Mise à jour de ${file}...`);

  try {
    const langData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    let updated = false;

    allKeys.forEach((key) => {
      if (!getNestedValue(langData, key)) {
        const translationKey = key;
        const translation =
          translations[langCode] && translations[langCode][translationKey];

        if (translation) {
          setNestedValue(langData, key, translation);
          updated = true;
          console.log(`  Ajouté: ${key} = "${translation}"`);
        } else {
          // Utiliser la valeur anglaise comme fallback
          const enValue = getNestedValue(enData, key);
          if (enValue) {
            setNestedValue(langData, key, enValue);
            updated = true;
            console.log(`  Ajouté (en): ${key} = "${enValue}"`);
          }
        }
      }
    });

    if (updated) {
      fs.writeFileSync(filePath, JSON.stringify(langData, null, 2));
      console.log(`✓ ${file} mis à jour`);
    } else {
      console.log(`- ${file} déjà à jour`);
    }
  } catch (error) {
    console.error(`Erreur avec ${file}:`, error.message);
  }
});

console.log("Synchronisation terminée !");
