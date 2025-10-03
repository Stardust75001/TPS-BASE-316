/**
 * Analytics Configuration Manager
 * Centralise la gestion des IDs et tokens pour les services d'analytics
 */

// Configuration par défaut (peut être surchargée par les variables d'environnement)
const DEFAULT_CONFIG = {
  // Google Tag Manager
  GTM_CONTAINER_ID: "",

  // Google Analytics 4
  GA4_MEASUREMENT_ID: "",

  // Webmaster Tools Verification
  GOOGLE_SITE_VERIFICATION: "",
  AHREFS_SITE_VERIFICATION: "",

  // Social Media Pixels
  FACEBOOK_PIXEL_ID: "",

  // Security & Anti-Bot Protection
  TURNSTILE_SITE_KEY: "",
  TURNSTILE_ENABLED: false,
  TURNSTILE_THEME: "auto",
  TURNSTILE_SIZE: "normal",

  // Sentry Error Monitoring
  SENTRY_DSN: "",
  SENTRY_ENVIRONMENT: "production",

  // Debug
  DEBUG_MODE: false,
  NODE_ENV: "production",
};

/**
 * Classe pour gérer la configuration des analytics
 */
class AnalyticsConfig {
  constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.loadFromSettings();
    this.loadFromEnv();
  }

  /**
   * Charge la configuration depuis les settings Shopify theme
   */
  loadFromSettings() {
    if (typeof window !== "undefined" && window.shopifyThemeSettings) {
      const settings = window.shopifyThemeSettings;

      if (settings.gtm_id) this.config.GTM_CONTAINER_ID = settings.gtm_id;
      if (settings.ga4_id) this.config.GA4_MEASUREMENT_ID = settings.ga4_id;
      if (settings.google_site_verification)
        this.config.GOOGLE_SITE_VERIFICATION =
          settings.google_site_verification;
      if (settings.ahrefs_site_verification)
        this.config.AHREFS_SITE_VERIFICATION =
          settings.ahrefs_site_verification;
      if (settings.facebook_pixel_id)
        this.config.FACEBOOK_PIXEL_ID = settings.facebook_pixel_id;
      if (settings.turnstile_site_key)
        this.config.TURNSTILE_SITE_KEY = settings.turnstile_site_key;
      if (typeof settings.turnstile_enabled !== "undefined")
        this.config.TURNSTILE_ENABLED = settings.turnstile_enabled;
      if (settings.turnstile_theme)
        this.config.TURNSTILE_THEME = settings.turnstile_theme;
      if (settings.turnstile_size)
        this.config.TURNSTILE_SIZE = settings.turnstile_size;
    }
  }

  /**
   * Charge la configuration depuis les variables d'environnement (Node.js)
   */
  loadFromEnv() {
    if (typeof process !== "undefined" && process.env) {
      const env = process.env;

      if (env.GTM_CONTAINER_ID)
        this.config.GTM_CONTAINER_ID = env.GTM_CONTAINER_ID;
      if (env.GA4_MEASUREMENT_ID)
        this.config.GA4_MEASUREMENT_ID = env.GA4_MEASUREMENT_ID;
      if (env.GOOGLE_SITE_VERIFICATION)
        this.config.GOOGLE_SITE_VERIFICATION = env.GOOGLE_SITE_VERIFICATION;
      if (env.AHREFS_SITE_VERIFICATION)
        this.config.AHREFS_SITE_VERIFICATION = env.AHREFS_SITE_VERIFICATION;
      if (env.FACEBOOK_PIXEL_ID)
        this.config.FACEBOOK_PIXEL_ID = env.FACEBOOK_PIXEL_ID;
      if (env.TURNSTILE_SITE_KEY)
        this.config.TURNSTILE_SITE_KEY = env.TURNSTILE_SITE_KEY;
      if (env.TURNSTILE_ENABLED)
        this.config.TURNSTILE_ENABLED = env.TURNSTILE_ENABLED === "true";
      if (env.TURNSTILE_THEME)
        this.config.TURNSTILE_THEME = env.TURNSTILE_THEME;
      if (env.TURNSTILE_SIZE) this.config.TURNSTILE_SIZE = env.TURNSTILE_SIZE;
      if (env.SENTRY_DSN) this.config.SENTRY_DSN = env.SENTRY_DSN;
      if (env.SENTRY_ENVIRONMENT)
        this.config.SENTRY_ENVIRONMENT = env.SENTRY_ENVIRONMENT;
      if (env.DEBUG_MODE) this.config.DEBUG_MODE = env.DEBUG_MODE === "true";
      if (env.NODE_ENV) this.config.NODE_ENV = env.NODE_ENV;
    }
  }

  /**
   * Récupère une valeur de configuration
   */
  get(key) {
    return this.config[key];
  }

  /**
   * Définit une valeur de configuration
   */
  set(key, value) {
    this.config[key] = value;
  }

  /**
   * Récupère toute la configuration
   */
  getAll() {
    return { ...this.config };
  }

  /**
   * Vérifie si un service est configuré
   */
  isServiceEnabled(service) {
    switch (service) {
      case "gtm":
        return !!this.config.GTM_CONTAINER_ID;
      case "ga4":
        return !!this.config.GA4_MEASUREMENT_ID;
      case "facebook":
        return !!this.config.FACEBOOK_PIXEL_ID;
      case "turnstile":
        return (
          this.config.TURNSTILE_ENABLED && !!this.config.TURNSTILE_SITE_KEY
        );
      case "sentry":
        return !!this.config.SENTRY_DSN;
      default:
        return false;
    }
  }

  /**
   * Mode debug activé ?
   */
  isDebugMode() {
    return this.config.DEBUG_MODE || this.config.NODE_ENV === "development";
  }

  /**
   * Log debug conditionnel
   */
  debug(...args) {
    if (this.isDebugMode()) {
      console.log("[Analytics Config]", ...args);
    }
  }

  /**
   * Valide la configuration
   */
  validate() {
    const errors = [];
    const warnings = [];

    // Vérifications des formats
    if (
      this.config.GTM_CONTAINER_ID &&
      !this.config.GTM_CONTAINER_ID.match(/^GTM-[A-Z0-9]+$/)
    ) {
      errors.push("GTM Container ID format invalide (doit être GTM-XXXXXXX)");
    }

    if (
      this.config.GA4_MEASUREMENT_ID &&
      !this.config.GA4_MEASUREMENT_ID.match(/^G-[A-Z0-9]+$/)
    ) {
      errors.push(
        "GA4 Measurement ID format invalide (doit être G-XXXXXXXXXX)"
      );
    }

    if (
      this.config.FACEBOOK_PIXEL_ID &&
      !this.config.FACEBOOK_PIXEL_ID.match(/^\d{15,16}$/)
    ) {
      errors.push(
        "Facebook Pixel ID format invalide (doit être un nombre de 15-16 chiffres)"
      );
    }

    // Avertissements de configuration
    if (!this.config.GTM_CONTAINER_ID && !this.config.GA4_MEASUREMENT_ID) {
      warnings.push("Aucun service d'analytics configuré (GTM ou GA4)");
    }

    if (this.config.GTM_CONTAINER_ID && this.config.GA4_MEASUREMENT_ID) {
      warnings.push(
        "GTM et GA4 configurés simultanément (GA4 sera désactivé en faveur de GTM)"
      );
    }

    if (this.isDebugMode()) {
      this.debug("Validation:", { errors, warnings });
    }

    return { errors, warnings, isValid: errors.length === 0 };
  }
}

// Instance globale
const analyticsConfig = new AnalyticsConfig();

// Export pour Node.js et navigateur
if (typeof module !== "undefined" && module.exports) {
  module.exports = { AnalyticsConfig, analyticsConfig };
} else if (typeof window !== "undefined") {
  window.analyticsConfig = analyticsConfig;
}

// Auto-validation en mode debug
if (analyticsConfig.isDebugMode()) {
  const validation = analyticsConfig.validate();
  if (validation.errors.length > 0) {
    console.error(
      "[Analytics Config] Erreurs de configuration:",
      validation.errors
    );
  }
  if (validation.warnings.length > 0) {
    console.warn("[Analytics Config] Avertissements:", validation.warnings);
  }
}
