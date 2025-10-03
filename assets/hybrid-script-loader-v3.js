// Système Hybride v3.0 - Fusion des suggestions ChatGPT + Notre expertise
(function () {
  console.log(
    "[INIT] Hybrid Intelligent Script Loader v3.0 - ChatGPT Enhanced"
  );

  // ===== Configuration & Controls =====
  window.HYBRID_LOADER = Object.assign(
    {
      force: null, // 'script' | 'fetch' | 'cdn' | 'fallback' | null (auto)
      timeout: 2000,
      debug: true,
      marks: true,
      autoScan: true, // Scanner automatique des data-hybrid-src (suggestion ChatGPT)
      preventScriptTags: false, // Éviter complètement les <script src> (mode ChatGPT)
    },
    window.HYBRID_LOADER
  );

  // URL parameters override
  (function () {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.has("loader"))
      window.HYBRID_LOADER.force = urlParams.get("loader");
    if (urlParams.has("autoscan"))
      window.HYBRID_LOADER.autoScan = urlParams.get("autoscan") === "true";
    if (urlParams.has("preventScript"))
      window.HYBRID_LOADER.preventScriptTags =
        urlParams.get("preventScript") === "true";
  })();

  // ===== Dynamic Script Discovery (ChatGPT Suggestion) =====
  function scanDataHybridSrc() {
    const discovered = [];
    document.querySelectorAll("script[data-hybrid-src]").forEach((el) => {
      const url = el.getAttribute("data-hybrid-src");
      const name = url.split("/").pop().replace(".js", "");
      discovered.push({
        name: name,
        localUrl: url,
        cdnUrls: [], // Could be enhanced with data-hybrid-cdn
        check: () => true, // Could be enhanced with data-hybrid-check
        fallback: () => console.log(`[FALLBACK] ${name} fallback activated`),
        element: el,
      });
      console.log(`[SCAN] Discovered script: ${name} from data-hybrid-src`);
    });
    return discovered;
  }

  // ===== Static Script Configuration =====
  const staticScripts = [
    {
      name: "bootstrap",
      localUrl:
        window.assetUrls?.bootstrap || "/assets/vendor-bootstrap.bundle.min.js",
      cdnUrls: [
        "https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.1/js/bootstrap.bundle.min.js",
      ],
      check: () => typeof bootstrap !== "undefined",
      fallback: () => {
        window.bootstrap = {
          Modal: {
            getOrCreateInstance: (el) => ({
              show: () => {},
              hide: () => {},
              toggle: () => {},
            }),
          },
          Collapse: {
            getOrCreateInstance: (el) => ({ show: () => {}, hide: () => {} }),
          },
          Offcanvas: {
            getOrCreateInstance: (el) => ({
              show: () => {},
              hide: () => {},
              toggle: () => {},
            }),
          },
        };
        console.log("[OK] Bootstrap fallback activated");
      },
    },
    {
      name: "splide",
      localUrl: window.assetUrls?.splide || "/assets/vendor-splide.min.js",
      cdnUrls: [
        "https://cdn.jsdelivr.net/npm/@splidejs/splide@4/dist/js/splide.min.js",
      ],
      check: () => typeof Splide !== "undefined",
      fallback: () => {
        window.Splide = function (selector, options) {
          return { mount: () => {}, destroy: () => {} };
        };
        console.log("[OK] Splide fallback activated");
      },
    },
    {
      name: "glightbox",
      localUrl:
        window.assetUrls?.glightbox || "/assets/vendor-glightbox.min.js",
      cdnUrls: [
        "https://cdn.jsdelivr.net/npm/glightbox@3/dist/js/glightbox.min.js",
      ],
      check: () => typeof GLightbox !== "undefined",
      fallback: () => {
        window.GLightbox = function (opt) {
          return { on: () => {}, destroy: () => {} };
        };
        document
          .querySelectorAll(".glightbox, [data-glightbox]")
          .forEach((el) => {
            el.removeAttribute("data-glightbox");
            if (el.tagName === "A") el.setAttribute("target", "_blank");
          });
        console.log("[OK] GLightbox fallback activated");
      },
    },
    // Theme scripts
    {
      name: "general",
      localUrl: window.assetUrls?.general || "/assets/general.js",
      cdnUrls: [],
      check: () => true,
      fallback: () => {},
    },
    {
      name: "search",
      localUrl: window.assetUrls?.search || "/assets/search.js",
      cdnUrls: [],
      check: () => true,
      fallback: () => {},
    },
    {
      name: "sections",
      localUrl: window.assetUrls?.sections || "/assets/sections.js",
      cdnUrls: [],
      check: () => true,
      fallback: () => {},
    },
    {
      name: "collection",
      localUrl: window.assetUrls?.collection || "/assets/collection.js",
      cdnUrls: [],
      check: () => true,
      fallback: () => {},
    },
    {
      name: "product",
      localUrl: window.assetUrls?.product || "/assets/product.js",
      cdnUrls: [],
      check: () => true,
      fallback: () => {},
    },
    {
      name: "cart",
      localUrl: window.assetUrls?.cart || "/assets/cart.js",
      cdnUrls: [],
      check: () => true,
      fallback: () => {},
    },
    {
      name: "custom",
      localUrl: window.assetUrls?.custom || "/assets/custom.js",
      cdnUrls: [],
      check: () => true,
      fallback: () => {},
    },
    {
      name: "stories",
      localUrl: window.assetUrls?.stories || "/assets/stories-tooltips.js",
      cdnUrls: [],
      check: () => true,
      fallback: () => {},
    },
  ];

  // Add wishlist if enabled
  if (window.wishlistEnabled) {
    staticScripts.push({
      name: "wishlist",
      localUrl: window.assetUrls?.wishlist || "/assets/wishlist.js",
      cdnUrls: [],
      check: () => true,
      fallback: () => {},
    });
  }

  // ===== Performance Helpers =====
  function perfStart(name) {
    if (window.HYBRID_LOADER.marks) {
      performance.mark(`load:${name}:start`);
    }
  }

  function perfEnd(name) {
    if (window.HYBRID_LOADER.marks) {
      performance.mark(`load:${name}:end`);
      performance.measure(
        `load:${name}`,
        `load:${name}:start`,
        `load:${name}:end`
      );
    }
  }

  // ===== Performance Report =====
  window.hybridReport = function () {
    if (!performance.getEntriesByType) return;

    const entries = performance
      .getEntriesByType("measure")
      .filter((e) => e.name.startsWith("load:"))
      .map((e) => ({
        script: e.name.replace("load:", ""),
        ms: Math.round(e.duration),
      }));

    console.table(entries);
    const total = entries.reduce((a, b) => a + b.ms, 0);
    console.log(
      "Total load (ms):",
      total,
      "| mode force =",
      window.HYBRID_LOADER.force || "auto",
      "| autoScan =",
      window.HYBRID_LOADER.autoScan,
      "| preventScript =",
      window.HYBRID_LOADER.preventScriptTags
    );
  };

  // ===== Script Loading Methods =====

  // 1. Classic script tag (with MIME detection)
  function tryScriptTag(url, name) {
    if (window.HYBRID_LOADER.preventScriptTags) {
      console.log(`[SKIP] Script tag prevented for ${name} (ChatGPT mode)`);
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = url;
      script.defer = true;

      let resolved = false;
      const cleanup = () => {
        if (!resolved) {
          resolved = true;
          try {
            document.head.removeChild(script);
          } catch (e) {}
        }
      };

      script.onload = () => {
        if (!resolved) {
          resolved = true;
          console.log(`[OK] ${name} loaded via script src`);
          resolve(true);
        }
      };

      script.onerror = () => {
        cleanup();
        console.warn(
          `[WARN] ${name} failed via script src - trying fetch/eval`
        );
        resolve(false);
      };

      // MIME error detection (timeout-based)
      setTimeout(() => {
        if (!resolved) {
          cleanup();
          console.warn(
            `[MIME] ${name} timeout - likely MIME error, switching to fetch/eval`
          );
          resolve(false);
        }
      }, window.HYBRID_LOADER.timeout);

      document.head.appendChild(script);
    });
  }

  // 2. Fetch/eval method (ChatGPT core suggestion, hardened)
  async function tryFetchEval(url, name) {
    try {
      console.log(`[FETCH] Loading ${name} from: ${url}`);
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(url, {
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(t);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const ct = (res.headers.get("content-type") || "").toLowerCase();
      const code = await res.text();

      // If content-type is not JS or the body looks like HTML (Shopify 401/403/404), skip
      const looksLikeHtml = /<(?:!doctype|html|head|body|script)\b/i.test(code);
      if (
        !ct.includes("javascript") ||
        looksLikeHtml ||
        code.trim().length < 20
      ) {
        console.warn(
          `[SKIP] ${name}: not JS (ct=${ct || "n/a"}, len=${
            code.length
          }) from ${url}`
        );
        return false; // let CDN/fallback handle it
      }

      // Avoid "Unexpected end of script" on truncated files by ensuring newline at end
      const safeCode = /[\r\n]$/.test(code) ? code : code + "\n";

      // Add a sourceURL for better DevTools attribution
      const withSource = safeCode + "\n//# sourceURL=" + name + ".js";

      (0, eval)(withSource);

      console.log(`[SUCCESS] ${name} loaded via fetch/eval`);
      return true;
    } catch (e) {
      console.warn(
        `[ERROR] ${name} fetch/eval failed: ${e.message} from ${url}`
      );
      return false;
    }
  }

  // ===== Hybrid Loading Process =====
  async function loadScriptHybrid(script) {
    const F = window.HYBRID_LOADER.force;

    perfStart(script.name);

    // Force mode handling
    if (F === "script") {
      const success = await tryScriptTag(script.localUrl, script.name);
      if (!success) script.fallback();
      perfEnd(script.name);
      return success;
    }

    if (F === "fetch") {
      const success = await tryFetchEval(script.localUrl, script.name);
      if (!success) script.fallback();
      perfEnd(script.name);
      return success;
    }

    if (F === "fallback") {
      script.fallback();
      perfEnd(script.name);
      return false;
    }

    // Auto mode (intelligent fallback cascade)
    if (!F || F === "auto") {
      // Try script tag first (unless prevented)
      if (!window.HYBRID_LOADER.preventScriptTags) {
        if (await tryScriptTag(script.localUrl, script.name)) {
          perfEnd(script.name);
          return true;
        }
      }

      // Try fetch/eval local
      if (await tryFetchEval(script.localUrl, script.name)) {
        perfEnd(script.name);
        return true;
      }

      // Try CDN fallbacks
      for (const cdnUrl of script.cdnUrls) {
        if (await tryFetchEval(cdnUrl, script.name)) {
          perfEnd(script.name);
          return true;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Final fallback
      console.warn(`[FALLBACK] Activating fallback for ${script.name}`);
      script.fallback();
      perfEnd(script.name);
      return false;
    }

    if (F === "cdn") {
      for (const cdnUrl of script.cdnUrls) {
        if (await tryFetchEval(cdnUrl, script.name)) {
          perfEnd(script.name);
          return true;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      script.fallback();
      perfEnd(script.name);
      return false;
    }
  }

  // ===== Main Loading Function =====
  async function loadAllScriptsHybrid() {
    console.log("[START] Starting hybrid loading process v3.0...");
    console.log(
      `[CONFIG] autoScan: ${window.HYBRID_LOADER.autoScan}, preventScript: ${window.HYBRID_LOADER.preventScriptTags}`
    );

    let allScripts = [...staticScripts];

    // Add discovered scripts if autoScan enabled
    if (window.HYBRID_LOADER.autoScan) {
      const discovered = scanDataHybridSrc();
      allScripts = allScripts.concat(discovered);
      console.log(
        `[SCAN] Total scripts: ${staticScripts.length} static + ${discovered.length} discovered`
      );
    }

    // Load all scripts
    for (const script of allScripts) {
      await loadScriptHybrid(script);
    }

    // Final validation check
    setTimeout(() => {
      allScripts.forEach((script) => {
        if (!script.check()) {
          console.warn(`[FINAL-CHECK] Final fallback check for ${script.name}`);
          script.fallback();
        }
      });
    }, 3000);

    console.log("[COMPLETE] Hybrid loading process v3.0 complete");

    // Auto-report if debug enabled
    if (window.HYBRID_LOADER.debug) {
      setTimeout(() => window.hybridReport(), 1000);
    }
  }

  // ===== Launch System =====
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadAllScriptsHybrid);
  } else {
    loadAllScriptsHybrid();
  }
})();
