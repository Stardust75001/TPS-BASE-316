// Mapping complet des codes Pantone vers leurs valeurs hexadécimales
// À utiliser pour renseigner le champ "Hex" dans les metaobjects Shopify

const pantoneToHex = {
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

  // Série 100
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
  "pantone-162-c": "#FF8A65",
  "pantone-163-c": "#FF7043",
  "pantone-164-c": "#FF5722",
  "pantone-166-c": "#FF3D00",
  "pantone-167-c": "#FF1744",
  "pantone-168-c": "#FF9999",
  "pantone-169-c": "#FF7F7F",
  "pantone-170-c": "#FF6565",
  "pantone-171-c": "#FF4B4B",
  "pantone-172-c": "#FF3131",
  "pantone-173-c": "#FF9E80",
  "pantone-174-c": "#FF8A65",
  "pantone-175-c": "#FF7043",
  "pantone-176-c": "#FF5722",
  "pantone-177-c": "#FF3D00",
  "pantone-178-c": "#FFAB91",
  "pantone-179-c": "#FF9E80",
  "pantone-180-c": "#FF8A65",
  "pantone-181-c": "#FF7043",
  "pantone-182-c": "#FF5722",
  "pantone-183-c": "#FFCCBC",
  "pantone-184-c": "#FFAB91",
  "pantone-185-c": "#FF8A65",

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

  // Série 300 (Bleus)
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

// === FONCTIONS UTILITAIRES ===

// Fonction pour convertir hex en RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Fonction pour générer du CSV pour import Shopify
function generateCSV() {
  const lines = ["Handle,Code,Name,Hex"];

  for (const [code, hex] of Object.entries(pantoneToHex)) {
    const handle = code;
    const name = code.replace(/-/g, " ").toUpperCase();
    lines.push(`${handle},${code},${name},${hex}`);
  }

  return lines.join("\n");
}

// Fonction pour générer du JSON pour export
function generateJSON() {
  return JSON.stringify(pantoneToHex, null, 2);
}

// === EXPORTS ===

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    pantoneToHex,
    hexToRgb,
    generateCSV,
    generateJSON,
  };
}

// Affichage console si exécuté directement
if (typeof window === "undefined" && typeof process !== "undefined") {
  console.log("=== MAPPING PANTONE TO HEX ===");
  console.log(`Total couleurs: ${Object.keys(pantoneToHex).length}`);
  console.log("\nExemples:");
  Object.entries(pantoneToHex)
    .slice(0, 10)
    .forEach(([code, hex]) => {
      console.log(`  ${code.padEnd(25)} -> ${hex}`);
    });

  console.log("\n=== CSV POUR SHOPIFY ===");
  console.log("Copiez le CSV ci-dessous pour import dans Shopify:");
  console.log(generateCSV());
}
