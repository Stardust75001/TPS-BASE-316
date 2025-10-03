// Type definitions for Shopify theme environment

interface ThemeProduct {
  addToCart: string;
  addedToCart: string;
  soldOut: string;
  unavailable: string;
  priceSale: string;
  priceFrom: string;
  save: string;
}

interface Theme {
  product: ThemeProduct;
}

interface BootstrapComponent {
  getOrCreateInstance(selector: string | Element): {
    show(): void;
    hide(): void;
    toggle(): void;
  };
}

interface Bootstrap {
  Offcanvas: BootstrapComponent;
  Modal: BootstrapComponent;
  Carousel: {
    getOrCreateInstance(
      element: Element,
      config?: any
    ): {
      to(index: number | string): void;
      show(): void;
      hide(): void;
    };
  };
  Popover: {
    getOrCreateInstance(element: Element): any;
  };
  Collapse: {
    getOrCreateInstance(element: Element): {
      show(): void;
      hide(): void;
    };
  };
  Tooltip: new (element: Element) => any;
}

interface ShopifyVariant {
  id: string;
  available: boolean;
  price: number;
  compare_at_price: number;
  sku: string;
  options: string[];
  featured_media?: {
    position: number;
  };
  selling_plan_allocations: Array<{
    price: number;
  }>;
}

interface Shopify {
  formatMoney(price: number): string;
  resizeImage(url: string, size: string, crop?: string): string;
  designMode: boolean;
  theme: {
    name: string;
    id: number;
    role: string;
  };
  shop: string;
  currency: {
    active: string;
    rate: string;
  };
  country: string;
  locale: string;
}

interface SplideInstance {
  go(index: number): void;
  sync(splide: SplideInstance): void;
  mount(extensions?: any): void;
  on(event: string, callback: Function): void;
  index: number;
}

interface SplideConstructor {
  new (element: Element, options?: any): SplideInstance;
}

interface GLightboxInstance {
  on(event: string, callback: Function): void;
  destroy(): void;
}

interface GLightboxConstructor {
  (options?: any): GLightboxInstance;
}

// Extend the global Window interface
declare global {
  interface Window {
    bootstrap: Bootstrap;
    theme: Theme;
    productVariants: ShopifyVariant[];
    GLightbox: GLightboxConstructor;
    Splide: SplideConstructor;
    SPR?: {
      initDomEls(): void;
      loadBadges(): void;
    };
    Shopify: Shopify;
    splide: {
      Extensions: any;
    };
    simpleParallax: any;
    ImageCompare: any;
    createNewCookie(name: string, value: any, days: number): void;
    ThemeUtils?: {
      safeElementOperation?: (
        selector: string,
        callback: (element: Element) => any
      ) => any;
    };
    splideInstances: {
      main?: SplideInstance;
      thumbs?: SplideInstance;
    };
    updateCartContents(response: Response): void;
    handleAtcFormVariantClick(btn: Element, event: Event): Promise<void>;
    handleAddToCartFormSubmit(
      form: HTMLFormElement,
      event: Event
    ): Promise<void>;
    handleProductOptionChange(input: HTMLInputElement): Promise<void>;
    handleProductItemVariantChange(
      select: HTMLSelectElement,
      event: Event
    ): void;
    handleBuyButtonClick(btn: HTMLButtonElement): void;
  }

  // Extend EventTarget for Shopify events
  interface EventTarget {
    querySelector?: (selector: string) => Element | null;
    querySelectorAll?: (selector: string) => NodeListOf<Element>;
    closest?: (selector: string) => Element | null;
    dataset?: DOMStringMap;
    style?: CSSStyleDeclaration;
    tagName?: string;
    src?: string;
    href?: string;
  }

  // Extend Element for additional methods
  interface Element {
    focus?: () => void;
    pause?: () => void;
    complete?: boolean;
    play?: () => Promise<void>;
    muted?: boolean;
  }

  // Extend Window for custom properties
  interface Window {
    collageDynamiqueSectionId?: string;
  }

  // Declare global objects
  const bootstrap: Bootstrap;
  const Shopify: Shopify;
  const Splide: SplideConstructor;
  const GLightbox: GLightboxConstructor;
  const simpleParallax: any;
  const ImageCompare: any;
  const Masonry: any;
}

export {};
