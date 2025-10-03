// @ts-nocheck
/* ========================================================================
   INFORMATIONS GÉNÉRALES SUR LE SITE
   Propriété de © 2019/2024 Shopiweb.fr
   Pour plus d'informations, visitez : https://www.shopiweb.fr
   ======================================================================== */

// Robust initialization of global objects for Shopify theme environment
(function () {
  "use strict";

  // Ensure bootstrap is available
  if (typeof window.bootstrap === "undefined") {
    window.bootstrap = {
      Modal: {
        getOrCreateInstance: function (selector) {
          return { show: function () {}, hide: function () {} };
        },
      },
      Offcanvas: {
        getOrCreateInstance: function (selector) {
          return { show: function () {}, hide: function () {} };
        },
      },
      Tooltip: function (element) {
        return {};
      },
    };
  }

  // Ensure theme is available
  if (typeof window.theme === "undefined") {
    window.theme = {
      product: {
        addToCart: "Add to Cart",
        addedToCart: "Added to Cart",
        soldOut: "Sold Out",
        unavailable: "Unavailable",
        priceSale: "Sale Price",
        priceFrom: "From",
        save: "Save",
      },
    };
  }

  // Ensure other required globals
  window.productVariants = window.productVariants || [];
  window.updateCartContents =
    window.updateCartContents ||
    function () {
      console.log("updateCartContents called");
    };

  window.GLightbox =
    window.GLightbox ||
    function (options) {
      return {
        on: function () {},
        destroy: function () {},
      };
    };

  window.splideInstances = window.splideInstances || {};

  // Ensure Shopify global exists
  if (typeof window.Shopify === "undefined") {
    window.Shopify = {
      formatMoney: function (price) {
        return typeof price === "number"
          ? "$" + (price / 100).toFixed(2)
          : price;
      },
    };
  }
})();

/* =====================
   Formulaire (ATC) basé sur la variante
   ===================== */
window.handleAtcFormVariantClick = async (btn, event) => {
  const form = btn.closest("form");
  form.querySelector('[name="id"]').value = btn.dataset.variantId;

  window.handleAddToCartFormSubmit(form, event);
};

/* =====================
   Formulaire principal d'ajout au panier (ATC)
   ===================== */
window.handleAddToCartFormSubmit = async (form, event) => {
  event.preventDefault();

  const btn = form.querySelector(".btn-atc");

  btn.innerHTML = `
        <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    `;

  form.classList.add("loading");

  const response = await fetch("/cart/add.js", {
    method: "POST",
    body: new FormData(form),
    headers: {
      Accept: "application/json",
    },
  });

  form.classList.remove("loading");
  btn.innerHTML = window.theme.product.addedToCart;

  setTimeout(() => {
    btn.innerHTML = btn.dataset.textAddToCart;
  }, 2000);

  window.updateCartContents(response);

  if (form.hasAttribute("data-shopiweb-upsell-modal")) return;
  if (btn.closest(".modal")) return;

  if (document.querySelector("#offcanvas-cart")) {
    if (window.bootstrap && window.bootstrap.Offcanvas) {
      window.bootstrap.Offcanvas.getOrCreateInstance("#offcanvas-cart").show();
    }
  }
};

/* =====================
   Mise à jour de divers éléments en cas de changement de variante nécessitant une nouvelle recherche de documents
   ===================== */
window.addEventListener("variantChange.shopiweb.product", async (event) => {
  const inventoryBar = document.querySelector("#inventory-bar");

  if (inventoryBar) {
    inventoryBar.style.opacity = ".25";
  }

  try {
    const response = await fetch(window.location.href);
    const text = await response.text();
    const newDocument = new DOMParser().parseFromString(text, "text/html");

    document
      .querySelector("#inventory-bar")
      ?.replaceWith(newDocument.querySelector("#inventory-bar"));
    document
      .querySelector("#product-qty-breaks")
      ?.replaceWith(newDocument.querySelector("#product-qty-breaks"));
    document
      .querySelector("#product-store-availability-wrapper")
      ?.replaceWith(
        newDocument.querySelector("#product-store-availability-wrapper")
      );

    if (document.querySelector(".page-type-product")) {
      document
        .querySelector(".product-variant-selector")
        ?.replaceWith(newDocument.querySelector(".product-variant-selector"));
    }

    initializeInventoryBar();
    // initializeQuantityBreaks(); // Correction du nom de la fonction

    document.querySelectorAll('[role="tooltip"]').forEach((el) => el.remove());

    document
      .querySelectorAll('.product-options [data-bs-toggle="tooltip"]')
      .forEach((el) => new window.bootstrap.Tooltip(el));
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la variante :", error);
  }
});
/* =====================
   Options d'achat (plans de vente/abonnement)
   ===================== */
const initializePurchaseOptions = () => {
  const wrapper = document.querySelector("#purchase-options-product");

  if (!wrapper) return;

  wrapper.querySelectorAll('[name="purchase_option"]').forEach((input) => {
    input.addEventListener("change", () => {
      if (input.id === "purchase-options-one-time") {
        wrapper
          .querySelector("#purchase-delivery-options")
          .setAttribute("hidden", "hidden");
        wrapper.querySelector('[name="selling_plan"]').disabled = true;

        if (input.closest("#product-template")) {
          const url = new URL(window.location);
          url.searchParams.delete("selling_plan");
          window.history.replaceState({}, "", url);
        }
      } else {
        wrapper
          .querySelector("#purchase-delivery-options")
          .removeAttribute("hidden");
        wrapper.querySelector('[name="selling_plan"]').disabled = false;

        if (input.closest("#product-template")) {
          const url = new URL(window.location);
          url.searchParams.set(
            "variant",
            wrapper.closest(".product-content").querySelector('[name="id"]')
              .value
          );
          url.searchParams.set(
            "selling_plan",
            wrapper.querySelector('[name="selling_plan"]').value
          );
          window.history.replaceState({}, "", url);
        }
      }
    });
  });

  const selectDeliverEvery = wrapper.querySelector(
    "#options-select-purchase-delivery"
  );

  if (selectDeliverEvery) {
    selectDeliverEvery.addEventListener("change", () => {
      if (selectDeliverEvery.closest("#product-template")) {
        const url = new URL(window.location);
        url.searchParams.set(
          "selling_plan",
          wrapper.querySelector('[name="selling_plan"]').value
        );
        window.history.replaceState({}, "", url);
      }
    });
  }

  if (wrapper.dataset.subSelectedFirst === "true") {
    wrapper.querySelector("input#purchase-options-subscription").checked = true;
    wrapper
      .querySelector("input#purchase-options-subscription")
      .dispatchEvent(new Event("change"));
  }
};
initializePurchaseOptions();

/* =====================
   Sélecteur d'options de produits - Écouter les événements de changement
   ===================== */
window.handleProductOptionChange = async (input) => {
  const selectedOptions = [];

  input
    .closest("form")
    .querySelectorAll(".product-option")
    .forEach((elem) => {
      if (elem.type === "radio") {
        if (elem.checked) {
          selectedOptions.push(elem.value);
        }
      } else {
        selectedOptions.push(elem.value);
      }
    });

  const variantSelected = window.productVariants.find(
    (variant) =>
      JSON.stringify(variant.options) === JSON.stringify(selectedOptions)
  );

  console.log(variantSelected);

  const btn = input.closest("form").querySelector(".btn-atc");

  if (variantSelected) {
    input.closest("form").querySelector('[name="id"]').value =
      variantSelected.id;

    if (variantSelected.available) {
      btn.disabled = false;
      btn.innerHTML = window.theme.product.addToCart;
    } else {
      btn.disabled = true;
      btn.innerHTML = window.theme.product.soldOut;
    }

    if (variantSelected.compare_at_price > variantSelected.price) {
      input
        .closest(".product-content")
        .querySelector(".product-price").innerHTML = `
                  <span class="product-price-final me-3">
                      <span class="visually-hidden">
                          ${window.theme.product.priceSale} &nbsp;
                      </span>
                      ${Shopify.formatMoney(variantSelected.price)}
                  </span>
                  <span class="product-price-compare text-muted">
                      <span class="visually-hidden">
                          ${window.theme.product.priceFrom} &nbsp;
                      </span>
                      <s>
                          ${Shopify.formatMoney(
                            variantSelected.compare_at_price
                          )}
                      </s>
                  </span>
              `;
    } else {
      input
        .closest(".product-content")
        .querySelector(".product-price").innerHTML = `
                  <span class="product-price-final">
                      ${Shopify.formatMoney(variantSelected.price)}
                  </span>
              `;
    }
    if (variantSelected.available && variantSelected.compare_at_price) {
      input
        .closest(".product-content")
        .querySelector(".product-price")
        .insertAdjacentHTML(
          "beforeend",
          `
                  <span class="price-badge-sale badge">
                      ${window.theme.product.save}: ${Math.round(
            (1 - variantSelected.price / variantSelected.compare_at_price) * 100
          )}%
                  </span>
              `
        );
    } else if (!variantSelected.available) {
      input
        .closest(".product-content")
        .querySelector(".product-price")
        .insertAdjacentHTML(
          "beforeend",
          `
                  <span class="price-badge-sold-out badge">
                      ${window.theme.product.soldOut}
                  </span>
              `
        );
    }

    const purchaseOptionsWrapper = document.querySelector(
      "#purchase-options-product"
    );

    if (purchaseOptionsWrapper) {
      purchaseOptionsWrapper.querySelector(
        "input#purchase-options-one-time + label [data-price]"
      ).textContent = Shopify.formatMoney(variantSelected.price);
      purchaseOptionsWrapper.querySelector(
        "input#purchase-options-subscription + label [data-price]"
      ).textContent = Shopify.formatMoney(
        variantSelected.selling_plan_allocations[0].price
      );
    }

    const skuWrapper = input
      .closest(".product-content")
      .querySelector(".current-variant-sku");

    if (skuWrapper) {
      if (variantSelected.sku.length) {
        skuWrapper.textContent = variantSelected.sku;
        skuWrapper.removeAttribute("hidden");
      } else {
        skuWrapper.setAttribute("hidden", "hidden");
      }
    }

    if (input.closest("#product-template")) {
      const url = new URL(window.location);
      url.searchParams.set("variant", variantSelected.id);
      window.history.replaceState({}, "", url);
    }

    const customEvent = new CustomEvent("variantChange.shopiweb.product", {
      detail: variantSelected,
    });
    window.dispatchEvent(customEvent);
  } else {
    btn.disabled = true;
    btn.innerHTML = window.theme.product.unavailable;
  }

  if (input.closest(".color-swatches")) {
    input
      .closest(".product-option-wrapper")
      .querySelector(".color-swatches-title span").textContent = input.value;
  }

  if (input.closest(".size-buttons")) {
    input
      .closest(".product-option-wrapper")
      .querySelector(".size-buttons-title span").textContent = input.value;
  }
};

/* =====================
   Article - Changement de la variante
   ===================== */
window.handleProductItemVariantChange = (select, event) => {
  if (select.options[select.selectedIndex].dataset.variantImage?.length) {
    select.closest(".product-item").querySelector(".product-item-img").src =
      select.options[select.selectedIndex].dataset.variantImage;
  }

  const compareAtPrice =
    select.options[select.selectedIndex].dataset.compareAtPrice;
  const price = select.options[select.selectedIndex].dataset.price;

  if (compareAtPrice.length) {
    select
      .closest(".product-item")
      .querySelector(".product-item-price").innerHTML = `
            <span class="product-item-price-final me-1">
                <span class="visually-hidden">
                    ${window.theme.product.priceSale} &nbsp;
                </span>
                ${Shopify.formatMoney(price)}
            </span>
            <span class="product-item-price-compare text-muted">
                <span class="visually-hidden">
                    ${window.theme.product.priceFrom} &nbsp;
                </span>
                <s>
                    ${Shopify.formatMoney(compareAtPrice)}
                </s>
            </span>
        `;
  } else {
    select
      .closest(".product-item")
      .querySelector(".product-item-price").innerHTML = `
            <span class="product-item-price-final">
                ${Shopify.formatMoney(price)}
            </span>
        `;
  }
};

/* =====================
   Bouton (Acheter maintenant)
   ===================== */
window.handleBuyButtonClick = (btn) => {
  btn.innerHTML = `
        <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    `;
  const form = btn.closest("form");
  const variantId = form.querySelector('[name="id"]').value;
  const qty = Number(form.querySelector('input[name="quantity"]')?.value || 1);
  window.location.href = `/cart/${variantId}:${qty}`;
};

/* =====================
   Galerie de produits
   ===================== */
const initializeProductGallery = () => {
  document
    .querySelectorAll(".product-gallery:not(.init)")
    .forEach((gallery) => {
      gallery.classList.add("init");

      const main = new Splide(gallery.querySelector(".main-splide"), {
        start: Number(gallery.dataset.start),
        rewind: true,
        arrows: false,
        rewindByDrag: true,
        pagination: false,
        noDrag: "model-viewer",
        mediaQuery: "min",
        breakpoints: {
          0: {
            padding: {
              right: gallery.dataset.showThumbsMobile === "false" ? "4rem" : 0,
            },
          },
          992: { padding: 0 },
        },
        direction: document.documentElement.getAttribute("dir"),
      });

      const totalSlides = gallery.querySelectorAll(
        ".main-splide .splide__slide"
      ).length;

      const thumbs = new Splide(gallery.querySelector(".thumbs-splide"), {
        start: Number(gallery.dataset.start),
        arrows: Number(gallery.dataset.mediaCount > 3),
        gap: ".5rem",
        rewind: true,
        rewindByDrag: true,
        pagination: false,
        isNavigation: true,
        focus: totalSlides > 5 ? "center" : 0,
        mediaQuery: "min",
        breakpoints: {
          0: { perPage: 5 },
          576: { perPage: 5 },
          768: { perPage: 5 },
          992: { perPage: 5 },
          1200: { perPage: 5 },
          1400: { perPage: 5 },
        },
        direction: document.documentElement.getAttribute("dir"),
      });

      main.on("move", (newIndex, prevIndex) => {
        const iframe = gallery.querySelector(
          `.splide__slide:nth-child(${prevIndex + 1}) iframe`
        );
        const video = gallery.querySelector(
          `.splide__slide:nth-child(${prevIndex + 1}) video`
        );
        if (iframe) {
          // eslint-disable-next-line no-self-assign
          iframe.src = iframe.src;
        }
        if (video) {
          video.pause();
        }
      });

      window.addEventListener(
        "variantChange.shopiweb.product",
        (event) => {
          const variantSelected = event.detail;

          if (variantSelected.featured_media) {
            main.go(variantSelected.featured_media.position - 1);
          }
        },
        false
      );

      main.sync(thumbs);
      main.mount();
      thumbs.mount();

      if (window.matchMedia("(min-width: 992px)").matches) {
        const navbarHeight =
          document.querySelector('[id*="__navbar"].sticky-top')?.clientHeight ||
          0;
        const announcementBarHeight =
          document.querySelector('[id*="__announcement-bar"].sticky-top')
            ?.clientHeight || 0;

        const galleryWrapper = gallery.closest(".product-gallery-wrapper");
        if (!galleryWrapper) return;
        galleryWrapper.style.position = "sticky";
        galleryWrapper.style.top = `${
          navbarHeight + announcementBarHeight + 20
        }px`;
        galleryWrapper.style.zIndex = "1";
      }

      if (window.GLightbox) {
        // eslint-disable-next-line no-unused-vars
        const lightbox = GLightbox({
          selector: `[data-gallery="product-gallery-${gallery.dataset.productId}"]`,
          videosWidth: "1290px",
          loop: true,
        });
        lightbox.on("open", () => {
          gallery.querySelectorAll("video").forEach((video) => {
            video.pause();
          });
        });
        lightbox.on("slide_changed", ({ prev, current }) => {
          main.go(current.index);
        });
      }

      const modelViewer = gallery.querySelector("model-viewer");

      if (modelViewer) {
        const increaseBtn = gallery.querySelector(
          "[data-model-3d-increase-zoom]"
        );
        const decreaseBtn = gallery.querySelector(
          "[data-model-3d-decrease-zoom]"
        );
        const fullscreenBtn = gallery.querySelector(
          "[data-model-3d-fullscreen]"
        );

        increaseBtn.addEventListener("click", () => {
          modelViewer.zoom(1);
        });

        decreaseBtn.addEventListener("click", () => {
          modelViewer.zoom(-1);
        });

        fullscreenBtn.addEventListener("click", () => {
          if (document.fullscreenElement) {
            document.exitFullscreen();
            fullscreenBtn
              .querySelector(".bi-fullscreen")
              .removeAttribute("hidden");
            fullscreenBtn
              .querySelector(".bi-fullscreen-exit")
              .setAttribute("hidden", "hidden");
          } else {
            modelViewer
              .closest(".product-gallery-model-3d")
              .requestFullscreen();
            fullscreenBtn
              .querySelector(".bi-fullscreen")
              .setAttribute("hidden", "hidden");
            fullscreenBtn
              .querySelector(".bi-fullscreen-exit")
              .removeAttribute("hidden");
          }
        });
      }
    });
};
initializeProductGallery();

document.addEventListener("shopify:section:load", (e) => {
  if (e.target.querySelector(".product-gallery")) {
    initializeProductGallery();
  }
});

window.addEventListener(
  "updated.shopiweb.collection",
  initializeProductGallery
);

/* =====================
   Barre d'inventaire
   ===================== */
const initializeInventoryBar = () => {
  const wrapper = document.querySelector("#inventory-bar");

  if (!wrapper) return;

  const progressBar = wrapper.querySelector(".progress-bar");

  setTimeout(() => {
    progressBar.style.width = progressBar.dataset.width;
  }, 250);
};
initializeInventoryBar();

document.addEventListener("shopify:section:load", (e) => {
  if (e.target.querySelector("#inventory-bar")) {
    initializeInventoryBar();
  }
});

/* =====================
   Upsell modal
   ===================== */
const initializeUpsellModal = () => {
  const modal = document.querySelector("#modal-upsell-product");
  if (!modal) return;

  const form = document.querySelector(
    '#product-content form[onsubmit*="handleAddToCartFormSubmit"]'
  );
  if (!form) return;

  form.setAttribute("data-shopiweb-upsell-modal", "true");

  form.addEventListener("submit", (e) => {
    const modal = bootstrap.Modal.getOrCreateInstance("#modal-upsell-product");
    modal.show();
  });

  document.querySelectorAll("#modal-upsell-product .btn-atc").forEach((btn) => {
    btn.addEventListener("click", () => {
      const footerBtn = document.querySelector(
        "#modal-upsell-product .modal-footer .btn"
      );
      footerBtn.classList.remove(footerBtn.dataset.defaultClass);
      footerBtn.classList.add(footerBtn.dataset.activeClass);
    });
  });

  modal.addEventListener("hidden.bs.modal", () => {
    if (document.querySelector("#offcanvas-cart")) {
      bootstrap.Offcanvas.getOrCreateInstance("#offcanvas-cart").show();
    }
  });
};
initializeUpsellModal();
// Couleur dominante depuis l'image et gestion des pastilles couleur (swatches)
(function () {
  // Couleur dominante depuis l'image avec gestion CORS améliorée
  function averageColorFromImageURL(url) {
    return new Promise((resolve, reject) => {
      if (!url) {
        console.warn("URL d'image manquante");
        reject(new Error("URL d'image manquante"));
        return;
      }

      // Normaliser l'URL (ajouter https: si manquant)
      let normalizedUrl = url;
      if (url.startsWith("//")) {
        normalizedUrl = "https:" + url;
      }

      const img = new Image();

      // Essayer d'abord sans crossOrigin pour éviter les erreurs CORS
      img.onload = () => {
        try {
          const c = document.createElement("canvas");
          const ctx = c.getContext("2d", { willReadFrequently: true });
          const w = 32,
            h = 32;
          c.width = w;
          c.height = h;
          ctx.drawImage(img, 0, 0, w, h);

          // Essayer d'obtenir les données d'image
          try {
            const data = ctx.getImageData(0, 0, w, h).data;

            let r = 0,
              g = 0,
              b = 0,
              n = 0;

            for (let i = 0; i < data.length; i += 4) {
              const a = data[i + 3]; // Alpha
              if (a < 200) continue; // Ignorer les pixels transparents

              const rr = data[i],
                gg = data[i + 1],
                bb = data[i + 2];

              // Ignorer les pixels très blancs (probablement le fond)
              if (rr > 240 && gg > 240 && bb > 240) continue;

              r += rr;
              g += gg;
              b += bb;
              n++;
            }

            if (!n) {
              console.warn(
                "Aucun pixel de couleur trouvé dans l'image:",
                normalizedUrl
              );
              resolve("#cccccc"); // Gris par défaut
              return;
            }

            r = Math.round(r / n);
            g = Math.round(g / n);
            b = Math.round(b / n);

            const color = `rgb(${r}, ${g}, ${b})`;
            console.log(
              `✅ Couleur échantillonnée: ${color} depuis ${normalizedUrl}`
            );
            resolve(color);
          } catch (corsError) {
            console.warn(
              "Erreur CORS lors de l'accès aux pixels de l'image:",
              normalizedUrl
            );
            // Fallback : utiliser une couleur basée sur l'URL ou un hash
            const fallbackColor = generateFallbackColor(normalizedUrl);
            console.log(
              `🔄 Couleur de fallback générée: ${fallbackColor} pour ${normalizedUrl}`
            );
            resolve(fallbackColor);
          }
        } catch (e) {
          console.error(
            "Erreur lors de l'échantillonnage de couleur:",
            e,
            normalizedUrl
          );
          reject(e);
        }
      };

      img.onerror = (e) => {
        console.error("❌ Erreur de chargement de l'image:", normalizedUrl, e);
        reject(new Error(`Impossible de charger l'image: ${normalizedUrl}`));
      };

      // Utiliser l'URL normalisée
      img.src = normalizedUrl;

      // Timeout après 3 secondes (réduit pour être plus rapide)
      setTimeout(() => {
        console.warn(
          "⏱️ Timeout lors du chargement de l'image:",
          normalizedUrl
        );
        reject(
          new Error(`Timeout lors du chargement de l'image: ${normalizedUrl}`)
        );
      }, 3000);
    });
  }

  // Génère une couleur de fallback basée sur l'URL
  function generateFallbackColor(url) {
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    // Générer une couleur à partir du hash
    const r = (hash & 0xff0000) >> 16;
    const g = (hash & 0x00ff00) >> 8;
    const b = hash & 0x0000ff;

    // S'assurer que la couleur n'est pas trop claire
    const minBrightness = 100;
    const adjustedR = Math.max(r, minBrightness);
    const adjustedG = Math.max(g, minBrightness);
    const adjustedB = Math.max(b, minBrightness);

    return `rgb(${adjustedR}, ${adjustedG}, ${adjustedB})`;
  }

  // Mapping complet des codes Pantone vers les couleurs hexadécimales
  const pantoneColors = {
    // === COULEURS DE BASE ===

    // Noir et gris
    "pantone-process-black-c": "#000000",
    "pantone-black-c": "#2B2926",
    "pantone-cool-gray-1-c": "#E5E1E6",
    "pantone-cool-gray-2-c": "#D6D2D4",
    "pantone-cool-gray-3-c": "#C4BFC4",
    "pantone-cool-gray-4-c": "#B3ADB3",
    "pantone-cool-gray-5-c": "#A19DA1",
    "pantone-cool-gray-6-c": "#908C90",
    "pantone-cool-gray-7-c": "#7F7B82",
    "pantone-cool-gray-8-c": "#6D6A75",
    "pantone-cool-gray-9-c": "#5C5A66",
    "pantone-cool-gray-10-c": "#4A4957",
    "pantone-cool-gray-11-c": "#363640",
    "pantone-warm-gray-1-c": "#E8E0D5",
    "pantone-warm-gray-2-c": "#DFD3C3",
    "pantone-warm-gray-3-c": "#D1C0A5",
    "pantone-warm-gray-4-c": "#C2AD8D",
    "pantone-warm-gray-5-c": "#B59B7A",
    "pantone-warm-gray-6-c": "#A68B5B",
    "pantone-warm-gray-7-c": "#998C7C",
    "pantone-warm-gray-8-c": "#8C7F70",
    "pantone-warm-gray-9-c": "#7F7265",
    "pantone-warm-gray-10-c": "#72665A",
    "pantone-warm-gray-11-c": "#65594F",

    // Rouge et bordeaux
    "pantone-186-c": "#CE2939",
    "pantone-red-032-c": "#EE2737",
    "pantone-200-c": "#8B0000",
    "pantone-209-c": "#6B2C3E",
    "pantone-18-1664-tpx": "#922B3E",
    "pantone-219-c": "#C51E54",
    "pantone-223-c": "#E30B5D",

    // Orange
    "pantone-021-c": "#FF6600",
    "pantone-165-c": "#FF8200",
    "pantone-orange-021-c": "#FF6900",

    // Jaune
    "pantone-7406-c": "#FFD700",
    "pantone-yellow-c": "#FFED00",
    "pantone-7401-c": "#FFF2CC",
    "pantone-7404-c": "#D4AF37",

    // Bleu
    "pantone-300-c": "#006BA6",
    "pantone-286-c": "#0033A0",
    "pantone-2995-c": "#00B7C3",
    "pantone-7687-c": "#2E3192",
    "pantone-process-blue-c": "#0085CA",
    "pantone-312-c": "#00A0A0",
    "pantone-264-c": "#7B68EE",

    // Vert
    "pantone-354-c": "#00A651",
    "pantone-7724-c": "#2E8B57",
    "pantone-321-c": "#00B7A8",
    "pantone-green-c": "#00AD69",
    "pantone-367-c": "#7CB518",
    "pantone-5773-c": "#8B8C7A",

    // Rose et violet
    "pantone-2587-c": "#E6007E",
    "pantone-purple-c": "#7B3F98",
    "pantone-rhodamine-red-c": "#E10098",
    "pantone-706-c": "#FFB6C1",

    // Marron et beige
    "pantone-468-c": "#F5F5DC",
    "pantone-469-c": "#8B4513",
    "pantone-brown-c": "#8B4513",

    // Métallique
    "pantone-877-c": "#C0C0C0",
    "pantone-871-c": "#D4AF37",

    // === COULEURS ÉTENDUES ===

    // Série 100 (Jaunes et oranges)
    "pantone-100-c": "#F5F27A",
    "pantone-101-c": "#F7ED4A",
    "pantone-102-c": "#F9E814",
    "pantone-108-c": "#FFD100",
    "pantone-109-c": "#FFC20E",
    "pantone-116-c": "#FFDE17",
    "pantone-117-c": "#FDD900",
    "pantone-118-c": "#FFD300",
    "pantone-119-c": "#FFD100",
    "pantone-120-c": "#FFCC00",
    "pantone-121-c": "#FFD700",
    "pantone-122-c": "#FFCC14",
    "pantone-123-c": "#FFC72C",
    "pantone-124-c": "#FF8C00",
    "pantone-125-c": "#FF7F00",
    "pantone-130-c": "#FF8C00",
    "pantone-131-c": "#FF7518",
    "pantone-132-c": "#FF6600",
    "pantone-133-c": "#FF5F00",
    "pantone-134-c": "#FF4500",
    "pantone-137-c": "#FF8243",
    "pantone-138-c": "#FF7518",
    "pantone-139-c": "#FF6600",
    "pantone-140-c": "#FF5500",
    "pantone-141-c": "#FF4500",
    "pantone-142-c": "#FF6B35",
    "pantone-143-c": "#FF5722",
    "pantone-144-c": "#FF4500",
    "pantone-145-c": "#FF3300",
    "pantone-146-c": "#FF1100",
    "pantone-147-c": "#FF6B47",
    "pantone-148-c": "#FF5533",
    "pantone-149-c": "#FF4422",
    "pantone-150-c": "#FF3311",
    "pantone-151-c": "#FF2200",
    "pantone-152-c": "#FF7F50",
    "pantone-153-c": "#FF6347",
    "pantone-154-c": "#FF4500",
    "pantone-155-c": "#FF3300",
    "pantone-156-c": "#FF1100",
    "pantone-157-c": "#FF8A80",
    "pantone-158-c": "#FF7043",
    "pantone-159-c": "#FF5722",
    "pantone-160-c": "#FF3D00",
    "pantone-161-c": "#FF1744",

    // Série 200 (Rouges et roses)
    "pantone-201-c": "#A0001E",
    "pantone-202-c": "#8B0000",
    "pantone-203-c": "#760019",
    "pantone-204-c": "#610014",
    "pantone-205-c": "#4C000F",
    "pantone-206-c": "#FF69B4",
    "pantone-207-c": "#FF1493",
    "pantone-208-c": "#DC143C",
    "pantone-210-c": "#8B008B",
    "pantone-211-c": "#9932CC",
    "pantone-212-c": "#BA55D3",
    "pantone-213-c": "#DDA0DD",
    "pantone-214-c": "#DA70D6",
    "pantone-215-c": "#EE82EE",
    "pantone-216-c": "#FF00FF",
    "pantone-217-c": "#C71585",
    "pantone-218-c": "#B22222",
    "pantone-220-c": "#FF1493",
    "pantone-221-c": "#FF69B4",
    "pantone-222-c": "#FFB6C1",
    "pantone-224-c": "#FFC0CB",
    "pantone-225-c": "#FFCCCB",
    "pantone-226-c": "#FF69B4",
    "pantone-227-c": "#FF1493",
    "pantone-228-c": "#DC143C",
    "pantone-229-c": "#B22222",
    "pantone-230-c": "#8B0000",

    // Série 300 (Bleus et verts)
    "pantone-301-c": "#005A9C",
    "pantone-302-c": "#004D87",
    "pantone-303-c": "#004072",
    "pantone-304-c": "#00335D",
    "pantone-305-c": "#002648",
    "pantone-306-c": "#00BFFF",
    "pantone-307-c": "#0099CC",
    "pantone-308-c": "#007399",
    "pantone-309-c": "#004D66",
    "pantone-310-c": "#002633",
    "pantone-311-c": "#00CED1",
    "pantone-313-c": "#00A0B0",
    "pantone-314-c": "#008080",
    "pantone-315-c": "#006060",
    "pantone-316-c": "#004040",
    "pantone-317-c": "#87CEEB",
    "pantone-318-c": "#4682B4",
    "pantone-319-c": "#00CED1",
    "pantone-320-c": "#40E0D0",
    "pantone-322-c": "#20B2AA",
    "pantone-323-c": "#48D1CC",
    "pantone-324-c": "#00FFFF",
    "pantone-325-c": "#E0FFFF",
    "pantone-326-c": "#AFEEEE",
    "pantone-327-c": "#40E0D0",
    "pantone-328-c": "#00CED1",
    "pantone-329-c": "#008B8B",
    "pantone-330-c": "#006767",
  };

  function getPantoneColor(pantoneCode) {
    if (!pantoneCode) return null;
    const normalizedCode = pantoneCode.toLowerCase().trim();

    // Recherche directe dans notre mapping
    if (pantoneColors[normalizedCode]) {
      return pantoneColors[normalizedCode];
    }

    // Essayer sans le suffixe '-c'
    const withoutSuffix = normalizedCode.replace(/-c$/, "");
    if (pantoneColors[withoutSuffix + "-c"]) {
      return pantoneColors[withoutSuffix + "-c"];
    }

    // Log pour débuggage si la couleur n'est pas trouvée
    console.log(`Couleur Pantone non trouvée: ${pantoneCode}`);
    return null;
  }

  async function initColorSwatches() {
    console.log("🚀 Début initColorSwatches");

    // Attendre un peu pour s'assurer que le DOM est bien chargé
    await new Promise((resolve) => setTimeout(resolve, 100));

    const wrap = document.querySelector(".color-swatches");
    console.log("🔍 Recherche .color-swatches:", wrap);

    if (!wrap) {
      console.log(
        "❌ Élément .color-swatches non trouvé, essai avec d'autres sélecteurs..."
      );
      // Essayer d'autres sélecteurs possibles
      const alternativeSelectors = [
        "ul.color-swatches",
        ".product-options .color-swatches",
        "[class*='color-swatches']",
        ".product-variant-selector .color-swatches",
      ];

      for (const selector of alternativeSelectors) {
        const altWrap = document.querySelector(selector);
        console.log(`🔍 Essai sélecteur ${selector}:`, altWrap);
        if (altWrap) {
          console.log(`✅ Trouvé avec ${selector}`);
          break;
        }
      }

      // Debug: afficher tous les éléments qui pourraient contenir des swatches
      const allElements = document.querySelectorAll(
        "[class*='swatch'], [class*='color']"
      );
      console.log(
        "🔍 Tous les éléments avec 'swatch' ou 'color':",
        allElements
      );

      return;
    }

    const swatches = [...wrap.querySelectorAll(".swatch")];
    console.log(`🎨 Trouvé ${swatches.length} pastilles de couleur:`, swatches);

    if (swatches.length === 0) {
      console.warn("⚠️ Aucune pastille .swatch trouvée dans .color-swatches");
      return;
    }

    // Colorer les pastilles depuis les métadonnées Pantone (priorité) puis images du produit (fallback)
    await Promise.allSettled(
      swatches.map(async (btn, index) => {
        const chip = btn.querySelector(".swatch-chip");
        if (!chip) {
          console.warn(`❌ Swatch ${index}: .swatch-chip non trouvé`);
          return;
        }

        console.log(`🔄 Traitement swatch ${index}:`, btn);

        // PRIORITÉ 1: Couleurs Pantone depuis l'attribut data-pantone (métadonnées)
        const pantoneCode = btn.getAttribute("data-pantone");
        if (pantoneCode) {
          console.log(
            `🎨 Swatch ${index}: Recherche couleur Pantone: ${pantoneCode}`
          );
          const pantoneColor = getPantoneColor(pantoneCode);
          if (pantoneColor) {
            chip.style.background = pantoneColor;
            chip.style.border = "2px solid #ddd";
            // Appliquer les styles CSS de base pour rendre la pastille visible
            chip.style.width = "32px";
            chip.style.height = "32px";
            chip.style.borderRadius = "50%";
            chip.style.display = "block";
            console.log(
              `✅ Swatch ${index}: Couleur Pantone (data-pantone): ${pantoneColor} pour ${pantoneCode}`
            );
            return; // On a trouvé la couleur Pantone, on s'arrête ici
          }
        } else {
          console.log(`ℹ️ Swatch ${index}: Pas d'attribut data-pantone`);
        }

        // PRIORITÉ 2: Couleurs Pantone depuis l'élément .swatch-pantone (métadonnées texte)
        const pantoneElement = btn.querySelector(".swatch-pantone");
        if (pantoneElement) {
          const pantoneText = pantoneElement.textContent || "";
          console.log(
            `🔍 Swatch ${index}: Texte Pantone trouvé: "${pantoneText}"`
          );
          const pantoneMatch = pantoneText.match(/Pantone:\s*(.+)/i);
          if (pantoneMatch) {
            const extractedCode = pantoneMatch[1].trim();
            console.log(
              `🎨 Swatch ${index}: Code Pantone extrait: ${extractedCode}`
            );
            // Ignorer si le code contient du Liquid non-parsé
            if (
              !extractedCode.includes("{{") &&
              !extractedCode.includes("Liquid syntax")
            ) {
              const pantoneColor = getPantoneColor(extractedCode);
              if (pantoneColor) {
                chip.style.background = pantoneColor;
                chip.style.border = "2px solid #ddd";
                // Appliquer les styles CSS de base pour rendre la pastille visible
                chip.style.width = "32px";
                chip.style.height = "32px";
                chip.style.borderRadius = "50%";
                chip.style.display = "block";
                console.log(
                  `✅ Swatch ${index}: Couleur Pantone (élément): ${pantoneColor} pour ${extractedCode}`
                );
                return; // On a trouvé la couleur Pantone, on s'arrête ici
              }
            } else {
              console.warn(
                `⚠️ Swatch ${index}: Code Pantone invalide (Liquid non-parsé): ${extractedCode}`
              );
            }
          }
        } else {
          console.log(`ℹ️ Swatch ${index}: Pas d'élément .swatch-pantone`);
        }

        // PRIORITÉ 3: Essayer de détecter la couleur depuis le nom de la variante ou le label
        const swatchLabel = btn.querySelector(".swatch-label");
        if (swatchLabel) {
          const labelText = swatchLabel.textContent || "";
          console.log(
            `🔍 Swatch ${index}: Tentative détection couleur depuis le label: "${labelText}"`
          );

          // Mapping simple nom -> Pantone pour les couleurs communes
          const colorMapping = {
            black: "pantone-process-black-c",
            noir: "pantone-process-black-c",
            white: "pantone-cool-gray-1-c",
            blanc: "pantone-cool-gray-1-c",
            gray: "pantone-cool-gray-7-c",
            grey: "pantone-cool-gray-7-c",
            gris: "pantone-cool-gray-7-c",
            red: "pantone-186-c",
            rouge: "pantone-186-c",
            blue: "pantone-300-c",
            bleu: "pantone-300-c",
            green: "pantone-354-c",
            vert: "pantone-354-c",
            brown: "pantone-469-c",
            marron: "pantone-469-c",
            beige: "pantone-468-c",
            yellow: "pantone-7406-c",
            jaune: "pantone-7406-c",
          };

          const normalizedLabel = labelText.toLowerCase().trim();
          for (const [colorName, pantoneCode] of Object.entries(colorMapping)) {
            if (normalizedLabel.includes(colorName)) {
              const pantoneColor = getPantoneColor(pantoneCode);
              if (pantoneColor) {
                chip.style.background = pantoneColor;
                chip.style.border = "2px solid #ddd";
                // Appliquer les styles CSS de base pour rendre la pastille visible
                chip.style.width = "32px";
                chip.style.height = "32px";
                chip.style.borderRadius = "50%";
                chip.style.display = "block";
                console.log(
                  `✅ Swatch ${index}: Couleur détectée depuis label "${labelText}" -> ${pantoneColor} (${pantoneCode})`
                );
                return;
              }
              break;
            }
          }
        }

        // FALLBACK: Échantillonner la couleur depuis l'image du produit (si pas de Pantone)
        const url = btn.getAttribute("data-media-url");
        if (url) {
          try {
            console.log(
              `� Swatch ${index}: Fallback - Tentative d'échantillonnage depuis l'image: ${url}`
            );
            const color = await averageColorFromImageURL(url);
            chip.style.background = color;
            chip.style.border = "2px solid #ddd";
            // Appliquer les styles CSS de base pour rendre la pastille visible
            chip.style.width = "32px";
            chip.style.height = "32px";
            chip.style.borderRadius = "50%";
            chip.style.display = "block";
            console.log(
              `✅ Swatch ${index}: Couleur échantillonnée depuis l'image (fallback): ${color}`
            );
            return;
          } catch (error) {
            console.warn(
              `❌ Swatch ${index}: Échec de l'échantillonnage depuis l'image:`,
              error.message
            );
          }
        } else {
          console.log(`ℹ️ Swatch ${index}: Pas d'URL d'image (data-media-url)`);
        }

        // Si aucune couleur trouvée, utiliser une couleur par défaut visible
        console.warn(
          `⚠️ Swatch ${index}: Aucune couleur trouvée, utilisation couleur par défaut`
        );
        chip.style.background = "#cccccc";
        chip.style.border = "2px solid #999";
        chip.style.width = "32px";
        chip.style.height = "32px";
        chip.style.borderRadius = "50%";
        chip.style.display = "block";
      })
    );

    console.log("🎨 Initialisation des pastilles terminée");

    // Sélection par défaut (si déjà un variant actif dans le <select>, on suit)
    const variantSelect = document.querySelector(
      'form[action*="/cart/add"] [name="id"]'
    );
    if (variantSelect) {
      const active = swatches.find(
        (b) => b.dataset.variantId === variantSelect.value
      );
      (active || swatches[0])?.setAttribute("aria-pressed", "true");
    } else {
      swatches[0]?.setAttribute("aria-pressed", "true");
    }

    // Clic = change variant + image avec gestion d'erreurs améliorée
    swatches.forEach((btn, index) => {
      btn.addEventListener("click", (event) => {
        try {
          console.log(`🖱️ Clic sur swatch ${index}:`, btn);

          // Empêcher le comportement par défaut si c'est un lien
          event.preventDefault();
          event.stopPropagation();

          swatches.forEach((b) => b.removeAttribute("aria-pressed"));
          btn.setAttribute("aria-pressed", "true");

          const variantId = btn.dataset.variantId;
          console.log(`🆔 Variant ID trouvé: ${variantId}`);

          if (variantSelect && variantId) {
            variantSelect.value = variantId;
            console.log(
              `✅ Mise à jour du sélecteur de variantes: ${variantId}`
            );
            variantSelect.dispatchEvent(new Event("change", { bubbles: true }));
          } else {
            console.warn("⚠️ Sélecteur de variante introuvable ou ID manquant");
          }

          // Synchroniser la galerie avec la photo de la variante sélectionnée
          const mediaId = btn.dataset.mediaId;
          if (mediaId) {
            console.log(`🖼️ Synchronisation galerie avec media-id: ${mediaId}`);

            // Chercher d'abord l'instance Splide principale
            const mainGallery = document.querySelector(".main-splide");
            if (mainGallery && window.splideInstances) {
              const splideMain = window.splideInstances.main;
              if (splideMain) {
                // Trouver l'index de la slide correspondant au media-id
                const slides = mainGallery.querySelectorAll(".splide__slide");
                let slideIndex = -1;
                slides.forEach((slide, index) => {
                  const slideMediaId =
                    slide.getAttribute("data-media-id") ||
                    slide
                      .querySelector("[data-media-id]")
                      ?.getAttribute("data-media-id");
                  if (slideMediaId === mediaId) {
                    slideIndex = index;
                  }
                });

                if (slideIndex >= 0) {
                  console.log(
                    `✅ Navigation vers slide ${slideIndex} pour media-id ${mediaId}`
                  );
                  splideMain.go(slideIndex);
                } else {
                  console.warn(
                    `⚠️ Slide introuvable pour media-id: ${mediaId}`
                  );
                }
              }
            }

            // Fallback : chercher directement l'élément avec data-media-id
            else {
              const targetSlide = document.querySelector(
                `[data-media-id="${mediaId}"]`
              );
              if (targetSlide) {
                console.log(
                  `🎯 Scroll vers l'élément avec media-id: ${mediaId}`
                );
                targetSlide.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                  inline: "center",
                });
              } else {
                console.warn(
                  `⚠️ Aucun élément trouvé avec media-id: ${mediaId}`
                );
              }
            }
          } else {
            console.log(`ℹ️ Pas de media-id pour cette variante`);

            // Fallback : remplace image principale si sélecteur connu
            const url = btn.dataset.mediaUrl;
            const main = document.querySelector(
              "[data-product-main-image], .product__media img, .product-gallery img"
            );
            if (main && url) main.src = url;
          }
        } catch (error) {
          console.error(`❌ Erreur lors du clic sur swatch ${index}:`, error);
          console.error("Stack trace:", error.stack);
        }
      });
    });
  }

  // Fonction pour synchroniser la galerie avec un media-id
  function syncGalleryToMediaId(mediaId) {
    console.log(`🖼️ Synchronisation galerie avec media-id: ${mediaId}`);

    // Chercher d'abord l'instance Splide principale
    const mainGallery = document.querySelector(".main-splide");
    if (mainGallery && window.splideInstances) {
      const splideMain = window.splideInstances.main;
      if (splideMain) {
        // Trouver l'index de la slide correspondant au media-id
        const slides = mainGallery.querySelectorAll(".splide__slide");
        let slideIndex = -1;
        slides.forEach((slide, index) => {
          const slideMediaId =
            slide.getAttribute("data-media-id") ||
            slide
              .querySelector("[data-media-id]")
              ?.getAttribute("data-media-id");
          if (slideMediaId === mediaId) {
            slideIndex = index;
          }
        });

        if (slideIndex >= 0) {
          console.log(
            `✅ Navigation vers slide ${slideIndex} pour media-id ${mediaId}`
          );
          splideMain.go(slideIndex);
          return;
        } else {
          console.warn(`⚠️ Slide introuvable pour media-id: ${mediaId}`);
        }
      }
    }

    // Fallback : chercher directement l'élément avec data-media-id
    const targetSlide = document.querySelector(`[data-media-id="${mediaId}"]`);
    if (targetSlide) {
      console.log(`🎯 Scroll vers l'élément avec media-id: ${mediaId}`);
      targetSlide.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    } else {
      console.warn(`⚠️ Aucun élément trouvé avec media-id: ${mediaId}`);
    }
  }

  // Fonction globale pour synchroniser les variantes avec la galerie
  function initVariantGallerySync() {
    console.log("🔗 Initialisation de la synchronisation variante-galerie");

    // Gérer tous les éléments de variantes (swatches, boutons taille, etc.)
    const allVariantElements = document.querySelectorAll(
      ".swatch, .size-button"
    );

    allVariantElements.forEach((element) => {
      element.addEventListener("click", () => {
        const mediaId =
          element.getAttribute("data-media-id") ||
          element.closest("label").getAttribute("data-media-id");

        if (mediaId) {
          syncGalleryToMediaId(mediaId);
        }
      });
    });

    // Écouter aussi les changements d'options via les inputs
    const optionInputs = document.querySelectorAll(".product-option");
    optionInputs.forEach((input) => {
      input.addEventListener("change", () => {
        const label = document.querySelector(`label[for="${input.id}"]`);
        const mediaId = label?.getAttribute("data-media-id");

        if (mediaId) {
          syncGalleryToMediaId(mediaId);
        }
      });
    });

    console.log(
      `✅ Synchronisation configurée pour ${allVariantElements.length} éléments de variantes`
    );
  }

  // Fonction d'initialisation robuste avec debugging amélioré
  function initColorSwatchesRobust() {
    console.log(
      "🎯 Tentative d'initialisation des swatches et synchronisation"
    );
    console.log("📊 État du DOM:", document.readyState);

    try {
      // Initialiser les swatches de couleur
      if (document.querySelector(".color-swatches")) {
        console.log("✅ Éléments .color-swatches trouvés, initialisation...");
        initColorSwatches();
      } else {
        console.log(
          "⏳ Swatches pas encore prêts, nouvelle tentative dans 500ms"
        );
        setTimeout(() => {
          if (document.querySelector(".color-swatches")) {
            console.log(
              "✅ Éléments .color-swatches trouvés après délai, initialisation..."
            );
            initColorSwatches();
          } else {
            console.log("⚠️ Swatches toujours pas trouvés après 500ms");
            // Debug: lister tous les éléments qui pourraient être des swatches
            const allSwatches = document.querySelectorAll(
              '[class*="swatch"], [class*="color"]'
            );
            console.log(
              "🔍 Éléments trouvés avec 'swatch' ou 'color':",
              allSwatches
            );
          }
        }, 500);
      }

      // Initialiser la synchronisation galerie
      setTimeout(() => {
        try {
          initVariantGallerySync();
        } catch (syncError) {
          console.error(
            "❌ Erreur lors de l'initialisation de la synchronisation galerie:",
            syncError
          );
        }
      }, 100);
    } catch (error) {
      console.error("❌ Erreur lors de l'initialisation des swatches:", error);
      console.error("Stack trace:", error.stack);
    }
  }

  // Lancement multiple pour s'assurer que ça fonctionne
  document.addEventListener("DOMContentLoaded", initColorSwatchesRobust);

  // Fallback si DOMContentLoaded a déjà été déclenché
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initColorSwatchesRobust);
  } else {
    // DOM déjà chargé
    setTimeout(initColorSwatchesRobust, 0);
  }

  // Fallback supplémentaire après le chargement de la page
  window.addEventListener("load", initColorSwatchesRobust);

  // Fonction de debug globale pour tester les swatches
  window.debugColorSwatches = function () {
    console.log("🔧 Debug des swatches de couleur");

    const colorSwatches = document.querySelector(".color-swatches");
    console.log("🎯 Container .color-swatches:", colorSwatches);

    if (colorSwatches) {
      const swatches = colorSwatches.querySelectorAll(".swatch");
      console.log(`📊 Nombre de swatches trouvés: ${swatches.length}`);

      swatches.forEach((swatch, index) => {
        console.log(`Swatch ${index}:`, {
          element: swatch,
          variantId: swatch.dataset.variantId,
          mediaId: swatch.dataset.mediaId,
          mediaUrl: swatch.dataset.mediaUrl,
          pantone: swatch.getAttribute("data-pantone"),
          hasClickListener: !!swatch.onclick,
        });
      });
    } else {
      console.log("❌ Aucun container .color-swatches trouvé");

      // Chercher des alternatives
      const alternatives = [
        "ul.color-swatches",
        ".product-options .color-swatches",
        "[class*='color-swatches']",
        ".swatch",
      ];

      alternatives.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          console.log(
            `✅ Trouvé ${elements.length} éléments avec: ${selector}`
          );
        }
      });
    }

    // Tester les objets globaux
    console.log("🌐 Objets globaux:");
    console.log("- window.bootstrap:", typeof window.bootstrap);
    console.log("- window.theme:", window.theme);
    console.log(
      "- window.productVariants:",
      window.productVariants?.length || 0,
      "variants"
    );
    console.log("- window.Shopify:", typeof window.Shopify);
  };
})();
