(function () {
  try {
    if (typeof window === "undefined") return;
    // avoid re-running
    if (window.__analyticsConfigInjectorRan) return;
    window.__analyticsConfigInjectorRan = true;

    function parseMeta() {
      try {
        var meta = document.querySelector('meta[name="analytics-config-json"]');
        if (!meta) return null;
        var raw = meta.getAttribute("content") || "";
        if (!raw) return null;
        return JSON.parse(raw);
      } catch (e) {
        return null;
      }
    }

    function applyConfig(cfg) {
      try {
        if (!cfg) return;
        window.analyticsEnvConfig = window.analyticsEnvConfig || {};
        Object.keys(cfg).forEach(function (k) {
          window.analyticsEnvConfig[k] = cfg[k];
        });
        // also expose uppercase env-style keys for compatibility
        Object.keys(cfg).forEach(function (k) {
          window.analyticsEnvConfig[k.toUpperCase()] = cfg[k];
        });
        if (console && console.log)
          console.log(
            "analyticsEnvConfig injected (injector):",
            window.analyticsEnvConfig
          );
      } catch (e) {
        if (console && console.warn)
          console.warn("analytics-config-injector failed", e);
      }
    }

    function tryApply() {
      var cfg = parseMeta();
      if (cfg) {
        applyConfig(cfg);
        return true;
      }
      return false;
    }

    if (
      document.readyState === "complete" ||
      document.readyState === "interactive"
    ) {
      tryApply();
    } else {
      document.addEventListener("DOMContentLoaded", function () {
        tryApply();
      });
    }
  } catch (e) {
    try {
      console.warn("analytics-config-injector top-level error", e);
    } catch (err) {}
  }
})();
