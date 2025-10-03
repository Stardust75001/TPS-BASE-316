/**
 * Enhanced Ecommerce Tracking for Shopify
 * Supports GTM, GA4, and Meta Pixel
 */

class EcommerceTracker {
  constructor() {
    this.gtmEnabled = window.dataLayer && typeof gtag !== "undefined";
    this.ga4Enabled = typeof gtag !== "undefined";
    this.pixelEnabled = typeof fbq !== "undefined";

    this.init();
  }

  init() {
    // Track cart events
    document.addEventListener("DOMContentLoaded", () => {
      this.trackAddToCartButtons();
      this.trackRemoveFromCart();
      this.trackCheckoutStart();
    });

    // Shopify Analytics API hooks
    if (window.ShopifyAnalytics) {
      window.ShopifyAnalytics.lib.track = function (original) {
        return function (event, payload) {
          this.handleShopifyEvent(event, payload);
          return original.apply(this, arguments);
        }.bind(this);
      }.bind(this)(window.ShopifyAnalytics.lib.track);
    }
  }

  trackAddToCartButtons() {
    document.querySelectorAll('form[action*="/cart/add"]').forEach((form) => {
      form.addEventListener("submit", (e) => {
        const formData = new FormData(form);
        const variantId = formData.get("id");
        const quantity = parseInt(formData.get("quantity") || 1);

        // Get product data from form or page
        const productData = this.getProductData(form);

        if (productData) {
          this.trackAddToCart(productData, quantity);
        }
      });
    });
  }

  trackRemoveFromCart() {
    document.querySelectorAll("[data-cart-remove]").forEach((button) => {
      button.addEventListener("click", (e) => {
        const productData = this.getProductDataFromCartItem(button);
        if (productData) {
          this.trackRemoveFromCart(productData);
        }
      });
    });
  }

  trackCheckoutStart() {
    // Track when user goes to checkout
    document
      .querySelectorAll(
        'a[href*="/checkouts"], button[name="add"], .checkout-button'
      )
      .forEach((element) => {
        element.addEventListener("click", () => {
          this.trackBeginCheckout();
        });
      });
  }

  trackAddToCart(productData, quantity = 1) {
    // GTM/GA4
    if (this.ga4Enabled) {
      gtag("event", "add_to_cart", {
        currency: productData.currency || "EUR",
        value: productData.price * quantity,
        items: [
          {
            item_id: productData.id,
            item_name: productData.title,
            item_category: productData.type,
            item_brand: productData.vendor,
            price: productData.price,
            quantity: quantity,
          },
        ],
      });
    }

    // Meta Pixel
    if (this.pixelEnabled) {
      fbq("track", "AddToCart", {
        content_ids: [productData.id],
        content_name: productData.title,
        content_type: "product",
        value: productData.price * quantity,
        currency: productData.currency || "EUR",
      });
    }
  }

  trackRemoveFromCart(productData) {
    // GTM/GA4
    if (this.ga4Enabled) {
      gtag("event", "remove_from_cart", {
        currency: productData.currency || "EUR",
        value: productData.price,
        items: [
          {
            item_id: productData.id,
            item_name: productData.title,
            item_category: productData.type,
            price: productData.price,
            quantity: 1,
          },
        ],
      });
    }
  }

  trackBeginCheckout() {
    // Get cart data
    fetch("/cart.js")
      .then((response) => response.json())
      .then((cart) => {
        const items = cart.items.map((item) => ({
          item_id: item.product_id,
          item_name: item.product_title,
          item_category: item.product_type,
          price: item.price / 100,
          quantity: item.quantity,
        }));

        // GTM/GA4
        if (this.ga4Enabled) {
          gtag("event", "begin_checkout", {
            currency: cart.currency || "EUR",
            value: cart.total_price / 100,
            items: items,
          });
        }

        // Meta Pixel
        if (this.pixelEnabled) {
          fbq("track", "InitiateCheckout", {
            content_ids: items.map((item) => item.item_id),
            contents: items,
            value: cart.total_price / 100,
            currency: cart.currency || "EUR",
          });
        }
      })
      .catch((error) => console.error("Cart tracking error:", error));
  }

  trackPurchase(orderData) {
    const items = orderData.line_items.map((item) => ({
      item_id: item.product_id,
      item_name: item.title,
      item_category: item.product_type,
      price: parseFloat(item.price),
      quantity: item.quantity,
    }));

    // GTM/GA4
    if (this.ga4Enabled) {
      gtag("event", "purchase", {
        transaction_id: orderData.order_number,
        value: parseFloat(orderData.total_price),
        currency: orderData.currency,
        items: items,
      });
    }

    // Meta Pixel
    if (this.pixelEnabled) {
      fbq("track", "Purchase", {
        value: parseFloat(orderData.total_price),
        currency: orderData.currency,
        content_ids: items.map((item) => item.item_id),
        contents: items,
      });
    }
  }

  getProductData(form) {
    // Try to get product data from various sources
    const productScript = document.querySelector(
      'script[type="application/ld+json"]'
    );
    if (productScript) {
      try {
        const productJson = JSON.parse(productScript.textContent);
        if (productJson["@type"] === "Product") {
          return {
            id: productJson.productID || productJson.sku,
            title: productJson.name,
            price: parseFloat(productJson.offers?.price || 0),
            currency: productJson.offers?.priceCurrency || "EUR",
            type: productJson.category,
            vendor: productJson.brand?.name,
          };
        }
      } catch (e) {
        console.warn("Could not parse product JSON-LD:", e);
      }
    }

    // Fallback: extract from page meta or form data
    return {
      id: form.querySelector('[name="id"]')?.value || "unknown",
      title:
        document.querySelector("h1")?.textContent?.trim() || "Unknown Product",
      price: this.extractPrice(),
      currency: "EUR",
      type: "unknown",
      vendor: "unknown",
    };
  }

  getProductDataFromCartItem(element) {
    const cartItem = element.closest("[data-cart-item]");
    if (!cartItem) return null;

    return {
      id: cartItem.dataset.productId || "unknown",
      title:
        cartItem.querySelector("[data-product-title]")?.textContent?.trim() ||
        "Unknown",
      price: this.extractPriceFromElement(cartItem),
      currency: "EUR",
    };
  }

  extractPrice() {
    const priceElement = document.querySelector(
      ".price, [data-price], .product-price"
    );
    if (!priceElement) return 0;

    const priceText =
      priceElement.textContent || priceElement.dataset.price || "0";
    return parseFloat(priceText.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
  }

  extractPriceFromElement(element) {
    const priceElement = element.querySelector(".price, [data-price]");
    if (!priceElement) return 0;

    const priceText =
      priceElement.textContent || priceElement.dataset.price || "0";
    return parseFloat(priceText.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
  }

  handleShopifyEvent(event, payload) {
    switch (event) {
      case "Product Viewed":
        // Already handled by page-level tracking
        break;
      case "Product Added To Cart":
        // Additional tracking if needed
        break;
      case "Checkout Started":
        // Additional tracking if needed
        break;
    }
  }
}

// Initialize tracker when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.ecommerceTracker = new EcommerceTracker();
  });
} else {
  window.ecommerceTracker = new EcommerceTracker();
}
