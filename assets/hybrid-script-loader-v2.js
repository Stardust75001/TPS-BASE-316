// Système Hybride de Chargement Intelligent + Performance & Debug
(function () {
  console.log("[INIT] Initializing Hybrid Intelligent Script Loader v2.0...");

  // ===== A/B + Performance Controls (suggestions ChatGPT) =====
  window.HYBRID_LOADER = Object.assign(
    {
      force: null, // 'script' | 'fetch' | 'cdn' | 'fallback' | null (auto)
      timeout: 2000, // détection échec MIME sur <script src>
      debug: true, // logs détaillés
      marks: true, // performance.mark / mesure
    },
    window.HYBRID_LOADER
  );

  // Lecture via URL ?loader=script|fetch|cdn|fallback
  (function () {
    const m = location.search.match(
      /[?&]loader=(script|fetch|cdn|fallback)\b/i
    );
    if (m) window.HYBRID_LOADER.force = m[1].toLowerCase();
  })();

  const scripts = [
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
          Carousel: {
            getOrCreateInstance: (el) => ({
              to: () => {},
              show: () => {},
              hide: () => {},
            }),
          },
          Tooltip: class {
            constructor(el) {
              this.dispose = () => {};
            }
          },
          Popover: { getOrCreateInstance: (el) => ({ dispose: () => {} }) },
        };
        console.log("[OK] Bootstrap fallback activated");
      },
    },
    {
      name: "splide",
      localUrl: window.assetUrls?.splide || "/assets/vendor-splide.min.js",
      cdnUrls: [
        "https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/js/splide.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/splide/4.1.4/js/splide.min.js",
      ],
      check: () => typeof Splide !== "undefined",
      fallback: () => {
        window.Splide = class {
          constructor(el, opt) {
            this.mount = () => {};
            this.go = () => {};
            this.on = () => {};
            this.sync = () => {};
            this.index = 0;
            this.destroy = () => {};
          }
        };
        window.splide = { Extensions: {} };
        console.log("[OK] Splide fallback activated");
      },
    },
    {
      name: "glightbox",
      localUrl:
        window.assetUrls?.glightbox || "/assets/vendor-glightbox.min.js",
      cdnUrls: [
        "https://cdn.jsdelivr.net/gh/biati-digital/glightbox/dist/js/glightbox.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/glightbox/3.2.0/js/glightbox.min.js",
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
    // Scripts thème Shopify
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
      name: "wishlist",
      localUrl: window.assetUrls?.wishlist || "/assets/wishlist.js",
      cdnUrls: [],
      check: () => window.wishlistEnabled || true,
      fallback: () => {},
    },
    {
      name: "stories-tooltips",
      localUrl: window.assetUrls?.stories || "/assets/stories-tooltips.js",
      cdnUrls: [],
      check: () => true,
      fallback: () => {},
    },
  ];

  // ===== Helpers de Performance (suggestion ChatGPT) =====
  function perfStart(name) {
    if (window.HYBRID_LOADER.marks && performance.mark) {
      performance.mark("start:" + name);
    }
  }

  function perfEnd(name) {
    if (window.HYBRID_LOADER.marks && performance.mark && performance.measure) {
      performance.mark("end:" + name);
      performance.measure("load:" + name, "start:" + name, "end:" + name);
    }
  }

  // ===== Tableau de bord instantané (suggestion ChatGPT) =====
  window.hybridReport = function () {
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
      window.HYBRID_LOADER.force || "auto"
    );
  };

  // 1. Tentative <script src> normale avec détection d'échec MIME
  function tryScriptTag(url, name) {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = url;
      script.defer = true;

      let resolved = false;
      const cleanup = () => {
        if (!resolved) {
          resolved = true;
          document.head.removeChild(script);
        }
      };

      script.onload = () => {
        if (!resolved) {
          resolved = true;
          console.log("[OK] " + name + " loaded via script src");
          resolve(true);
        }
      };

      script.onerror = () => {
        cleanup();
        console.warn(
          "[WARN] " + name + " failed via script src - trying fetch/eval"
        );
        resolve(false);
      };

      // Détection erreur MIME (timeout + vérification)
      setTimeout(() => {
        if (!resolved) {
          cleanup();
          console.warn(
            "[TIMEOUT] " + name + " MIME timeout - trying fetch/eval"
          );
          resolve(false);
        }
      }, window.HYBRID_LOADER.timeout);

      document.head.appendChild(script);
    });
  }

  // 2. Chargement via fetch/eval (contourne MIME)
  async function tryFetchEval(url, name) {
    try {
      console.log("[FETCH] Loading " + name + " from: " + url);
      const response = await fetch(url);
      if (!response.ok) throw new Error("HTTP " + response.status);

      const code = await response.text();
      eval(code); // Exécution directe du code

      console.log("[SUCCESS] " + name + " loaded via fetch/eval");
      return true;
    } catch (error) {
      console.warn("[ERROR] " + name + " fetch/eval failed: " + error.message);
      return false;
    }
  }

  // 3. Processus hybride intelligent avec Force Mode (suggestion ChatGPT)
  async function loadScriptHybrid(script) {
    const F = window.HYBRID_LOADER.force;

    perfStart(script.name);

    // 1) Si pas force ou force=script
    if (!F || F === "script") {
      if (await tryScriptTag(script.localUrl, script.name)) {
        perfEnd(script.name);
        return true;
      }
      if (F === "script") {
        script.fallback();
        perfEnd(script.name);
        return false;
      }
    }

    // 2) fetch/eval local (si pas force ou force=fetch)
    if (!F || F === "fetch") {
      if (await tryFetchEval(script.localUrl, script.name)) {
        perfEnd(script.name);
        return true;
      }
      if (F === "fetch") {
        script.fallback();
        perfEnd(script.name);
        return false;
      }
    }

    // 3) CDN fallbacks (si pas force ou force=cdn)
    if (!F || F === "cdn") {
      for (const cdnUrl of script.cdnUrls) {
        if (await tryFetchEval(cdnUrl, script.name)) {
          perfEnd(script.name);
          return true;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      if (F === "cdn") {
        script.fallback();
        perfEnd(script.name);
        return false;
      }
    }

    // 4) Fallback fonctionnel final
    console.warn("[FALLBACK] Activating fallback for " + script.name);
    script.fallback();
    perfEnd(script.name);
    return false;
  }

  // 4. Chargement de tous les scripts
  async function loadAllScriptsHybrid() {
    console.log("[START] Starting hybrid loading process...");

    for (const script of scripts) {
      await loadScriptHybrid(script);
    }

    // Vérification finale + réactivation si nécessaire
    setTimeout(() => {
      scripts.forEach((script) => {
        if (!script.check()) {
          console.warn("[FINAL-CHECK] Final fallback check for " + script.name);
          script.fallback();
        }
      });
    }, 3000);

    console.log("[COMPLETE] Hybrid loading process complete");

    // Auto-rapport si debug activé
    if (window.HYBRID_LOADER.debug) {
      setTimeout(() => window.hybridReport(), 1000);
    }
  }

  // ===== Switch/rollback ultra-simple (suggestion ChatGPT) =====
  // localStorage.setItem('hybrid.force', 'fetch'); ou 'script' | 'cdn' | 'fallback'
  // window.HYBRID_LOADER.force = localStorage.getItem('hybrid.force');

  // Démarrage du système hybride
  loadAllScriptsHybrid();
})();
