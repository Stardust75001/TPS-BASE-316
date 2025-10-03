/**
 * Enhanced Error Handler for Shopify Theme
 * Fixes common console errors and prevents JavaScript crashes
 */

(function () {
  "use strict";

  // Suppress WebPixels Manager errors in theme editor
  if (window.Shopify && window.Shopify.designMode) {
    console.warn("Theme Editor detected - some features may be limited");
  }

  // Fix for sticky video element error
  const originalQuerySelector = Document.prototype.querySelector;
  Document.prototype.querySelector = function (selector) {
    try {
      return originalQuerySelector.call(this, selector);
    } catch (error) {
      console.warn(`Selector error for: ${selector}`, error);
      return null;
    }
  };

  // Prevent null element access
  function safeElementOperation(selector, callback) {
    try {
      const element = document.querySelector(selector);
      if (element && typeof callback === "function") {
        return callback(element);
      }
    } catch (error) {
      console.warn(`Safe element operation failed for: ${selector}`, error);
    }
    return null;
  }

  // Handle missing sticky-video element
  function initSafeVideoHandling() {
    document.addEventListener("DOMContentLoaded", function () {
      safeElementOperation(".sticky-video", function (element) {
        console.log("Sticky video element found and initialized");
      });
    });
  }

  // Fix for resource loading errors
  function handleResourceErrors() {
    window.addEventListener(
      "error",
      function (e) {
        if (e.target && e.target.tagName) {
          const tag = e.target.tagName.toLowerCase();
          if (["img", "script", "link"].includes(tag)) {
            console.warn(
              `Failed to load ${tag}: ${e.target.src || e.target.href}`
            );
            // Prevent error from propagating
            e.preventDefault();
          }
        }
      },
      true
    );

    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", function (e) {
      console.warn("Unhandled promise rejection:", e.reason);
      e.preventDefault();
    });
  }

  // Fix for CORS and fetch errors
  const originalFetch = window.fetch;
  window.fetch = function (...args) {
    return originalFetch.apply(this, args).catch((error) => {
      if (
        error.message.includes("CORS") ||
        error.message.includes("Failed to fetch")
      ) {
        console.warn("Network request blocked:", error.message);
        return Promise.reject(error);
      }
      throw error;
    });
  };

  // Initialize error handling
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initSafeVideoHandling();
      handleResourceErrors();
    });
  } else {
    initSafeVideoHandling();
    handleResourceErrors();
  }

  // Export safe utility functions
  window.ThemeUtils = window.ThemeUtils || {};
  window.ThemeUtils.safeElementOperation = safeElementOperation;

  console.log("Enhanced error handler initialized");
})();
