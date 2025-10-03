#!/usr/bin/env node

/**
 * SCRIPT DE VALIDATION DU SYSTÈME COULEURS
 *
 * Ce script valide que les metaobjects colors sont correctement configurés
 * et que les données peuvent être récupérées par les templates Liquid.
 */

const fs = require("fs");
const { parse } = require("csv-parse");

class ColorSystemValidator {
  constructor() {
    this.csvFile = "css-colors-import.csv";
    this.errors = [];
    this.warnings = [];
    this.colors = [];
  }

  // Validation du fichier CSV
  async validateCSV() {
    console.log("📋 Validation du fichier CSV...");

    return new Promise((resolve, reject) => {
      const results = [];

      if (!fs.existsSync(this.csvFile)) {
        this.errors.push(`Fichier CSV manquant: ${this.csvFile}`);
        resolve(false);
        return;
      }

      fs.createReadStream(this.csvFile)
        .pipe(
          parse({
            columns: true,
            skip_empty_lines: true,
            trim: true,
          })
        )
        .on("data", (data) => {
          // Validation des champs requis
          if (!data.Name || data.Name.trim() === "") {
            this.errors.push(
              `Nom de couleur manquant ligne ${results.length + 2}`
            );
          }

          if (!data.Hex || !data.Hex.match(/^#[0-9A-Fa-f]{6}$/)) {
            this.errors.push(
              `Valeur hex invalide: ${data.Hex} pour ${data.Name}`
            );
          }

          if (!data.Code || data.Code.trim() === "") {
            this.warnings.push(`Code CSS manquant pour ${data.Name}`);
          }

          results.push({
            name: data.Name?.trim(),
            hex: data.Hex?.trim(),
            code: data.Code?.trim(),
          });
        })
        .on("end", () => {
          this.colors = results;
          console.log(`✅ ${results.length} couleurs validées dans le CSV`);
          resolve(true);
        })
        .on("error", (error) => {
          this.errors.push(`Erreur de lecture CSV: ${error.message}`);
          reject(false);
        });
    });
  }

  // Génération de code Liquid de test
  generateLiquidTest() {
    console.log("🧪 Génération du code Liquid de test...");

    const liquidTest = `{%- comment -%}
  TEST DE VALIDATION DES METAOBJECTS COLORS

  Ce code teste la récupération des couleurs depuis les metaobjects.
  À utiliser dans un template Shopify pour debug.
{%- endcomment -%}

<div class="color-validation-test">
  <h2>🌈 Test du Système Couleurs</h2>

  <!-- Test 1: Vérifier que les metaobjects colors existent -->
  <h3>Test 1: Présence des metaobjects</h3>
  {% if shop.metaobjects.colors %}
    <p>✅ Metaobject 'colors' trouvé</p>
    <p>📊 Nombre de couleurs: {{ shop.metaobjects.colors.values.size }}</p>
  {% else %}
    <p>❌ Metaobject 'colors' non trouvé</p>
    <p>⚠️ Assurez-vous d'avoir créé le metaobject et importé les données</p>
  {% endif %}

  <!-- Test 2: Afficher quelques couleurs d'exemple -->
  <h3>Test 2: Échantillon de couleurs</h3>
  {% if shop.metaobjects.colors.values.size > 0 %}
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin: 20px 0;">
      {% for color in shop.metaobjects.colors.values limit: 12 %}
        <div style="border: 1px solid #ddd; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="width: 50px; height: 50px; border-radius: 50%; margin: 0 auto 10px; border: 2px solid #ccc; background-color: {{ color.hex_value.value | default: '#cccccc' }};"></div>
          <strong>{{ color.display_name.value | default: 'N/A' }}</strong><br>
          <small>{{ color.hex_value.value | default: 'N/A' }}</small><br>
          <code>{{ color.css_name.value | default: 'N/A' }}</code>
        </div>
      {% endfor %}
    </div>
  {% else %}
    <p>❌ Aucune couleur trouvée dans les metaobjects</p>
  {% endif %}

  <!-- Test 3: Test de recherche par nom -->
  <h3>Test 3: Recherche de couleurs spécifiques</h3>
  {% assign test_colors = 'red,blue,green,black,white' | split: ',' %}
  <ul>
  {% for test_color in test_colors %}
    {% assign found_color = false %}
    {% for color in shop.metaobjects.colors.values %}
      {% assign css_name_lower = color.css_name.value | default: '' | downcase %}
      {% assign display_name_lower = color.display_name.value | default: '' | downcase %}
      {% if css_name_lower == test_color or display_name_lower == test_color %}
        <li>✅ {{ test_color | capitalize }}: trouvé ({{ color.display_name.value }}, {{ color.hex_value.value }})</li>
        {% assign found_color = true %}
        {% break %}
      {% endif %}
    {% endfor %}
    {% unless found_color %}
      <li>❌ {{ test_color | capitalize }}: non trouvé</li>
    {% endunless %}
  {% endfor %}
  </ul>

  <!-- Test 4: Test avec variantes produit -->
  {% if product %}
    <h3>Test 4: Compatibilité avec variantes produit</h3>
    <p>Produit testé: {{ product.title }}</p>
    {% if product.variants.size > 0 %}
      <ul>
      {% for variant in product.variants limit: 5 %}
        {% assign variant_color_found = false %}
        {% for i in (1..3) %}
          {% assign option_value = '' %}
          {% case i %}
            {% when 1 %}
              {% assign option_value = variant.option1 %}
            {% when 2 %}
              {% assign option_value = variant.option2 %}
            {% when 3 %}
              {% assign option_value = variant.option3 %}
          {% endcase %}

          {% if option_value and option_value != blank %}
            {% assign option_lower = option_value | downcase %}
            {% for color in shop.metaobjects.colors.values %}
              {% assign css_name_lower = color.css_name.value | default: '' | downcase %}
              {% assign display_name_lower = color.display_name.value | default: '' | downcase %}
              {% if css_name_lower == option_lower or display_name_lower == option_lower %}
                <li>✅ Variante "{{ variant.title }}" → Option "{{ option_value }}" → Couleur trouvée ({{ color.hex_value.value }})</li>
                {% assign variant_color_found = true %}
                {% break %}
              {% endif %}
            {% endfor %}
          {% endif %}

          {% if variant_color_found %}
            {% break %}
          {% endif %}
        {% endfor %}

        {% unless variant_color_found %}
          <li>⚠️ Variante "{{ variant.title }}" → Aucune couleur correspondante trouvée</li>
        {% endunless %}
      {% endfor %}
      </ul>
    {% else %}
      <p>ℹ️ Aucune variante sur ce produit</p>
    {% endif %}
  {% else %}
    <p>ℹ️ Pas de produit dans le contexte (test depuis collection ou page d'accueil)</p>
  {% endif %}

  <!-- Test 5: Performance -->
  <h3>Test 5: Informations techniques</h3>
  <ul>
    <li>Date du test: {{ 'now' | date: '%Y-%m-%d %H:%M:%S' }}</li>
    <li>Thème: {{ theme.name | default: 'N/A' }}</li>
    <li>Store: {{ shop.name }}</li>
    {% if shop.metaobjects.colors %}
      <li>Metaobject handle: colors</li>
      <li>Nombre total de couleurs: {{ shop.metaobjects.colors.values.size }}</li>
    {% endif %}
  </ul>
</div>

<style>
.color-validation-test {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: Arial, sans-serif;
}
.color-validation-test h2, .color-validation-test h3 {
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}
.color-validation-test ul {
  list-style-type: none;
  padding-left: 0;
}
.color-validation-test li {
  padding: 5px 0;
}
</style>`;

    fs.writeFileSync("test-color-validation.liquid", liquidTest);
    console.log("✅ Code Liquid de test créé: test-color-validation.liquid");

    return liquidTest;
  }

  // Génération d'un rapport de mapping CSV → Metaobject
  generateMappingReport() {
    console.log("📊 Génération du rapport de mapping...");

    const mappingReport = {
      csv_structure: {
        headers: ["Name", "Hex", "Code"],
        sample_data: this.colors.slice(0, 5),
      },
      metaobject_structure: {
        type: "colors",
        fields: [
          {
            key: "display_name",
            maps_to: "Name column in CSV",
            description: "User-friendly color name for display",
          },
          {
            key: "hex_value",
            maps_to: "Hex column in CSV",
            description: "Hexadecimal color value (e.g., #F0F8FF)",
          },
          {
            key: "css_name",
            maps_to: "Code column in CSV",
            description: "Standard CSS color name (e.g., aliceblue)",
          },
        ],
      },
      liquid_access: {
        display_name: "color.display_name.value",
        hex_value: "color.hex_value.value",
        css_name: "color.css_name.value",
      },
      validation_results: {
        total_colors: this.colors.length,
        errors: this.errors,
        warnings: this.warnings,
      },
    };

    fs.writeFileSync(
      "color-mapping-report.json",
      JSON.stringify(mappingReport, null, 2)
    );
    console.log("✅ Rapport de mapping créé: color-mapping-report.json");

    return mappingReport;
  }

  // Instructions d'intégration
  generateIntegrationInstructions() {
    console.log("📝 Génération des instructions d'intégration...");

    const instructions = `# 🎯 INSTRUCTIONS D'INTÉGRATION SYSTÈME COULEURS

## ✅ VALIDATION COMPLÉTÉE

### 📊 Résultats de la validation:
- ✅ CSV validé: ${this.colors.length} couleurs
- ❌ Erreurs: ${this.errors.length}
- ⚠️ Avertissements: ${this.warnings.length}

## 🚀 ÉTAPES D'INTÉGRATION

### 1. Import des données dans Shopify
\`\`\`
1. Admin Shopify → Settings → Custom Data → Metaobjects
2. Créer definition "colors" avec les champs:
   - display_name (Text, Required)
   - hex_value (Text, Required)
   - css_name (Text, Required)
3. Importer le CSV css-colors-import.csv
4. Mapper: Name → display_name, Hex → hex_value, Code → css_name
\`\`\`

### 2. Test de validation
\`\`\`liquid
<!-- Dans un template de test -->
{% render 'test-color-validation' %}
\`\`\`

### 3. Intégration dans templates produit
\`\`\`liquid
<!-- Dans templates/product.liquid -->
{% render 'product-color-variants', product: product %}
\`\`\`

### 4. Configuration des variantes produit
Les noms d'options de variantes doivent correspondre aux:
- \`css_name\` (ex: "red", "blue", "forestgreen")
- \`display_name\` (ex: "Red", "Blue", "Forest Green")

## 🔍 DEBUGGING

Si les couleurs ne s'affichent pas:
1. Vérifiez que le metaobject existe: \`{{ shop.metaobjects.colors.values.size }}\`
2. Testez l'accès aux données: \`{{ shop.metaobjects.colors.values.first.display_name.value }}\`
3. Vérifiez les noms de variantes produit
4. Utilisez le template de validation: test-color-validation.liquid

## 📋 MAPPING DES DONNÉES

| CSV Column | Metaobject Field | Liquid Access |
|------------|------------------|---------------|
| Name       | display_name     | color.display_name.value |
| Hex        | hex_value        | color.hex_value.value |
| Code       | css_name         | color.css_name.value |

## ⚡ PERFORMANCE

- Metaobjects mis en cache par Shopify
- ~${this.colors.length} couleurs = ~${Math.round(
      this.colors.length * 0.1
    )}KB de données
- Recherche optimisée par handle/nom

---
Généré automatiquement le ${new Date().toISOString()}
`;

    fs.writeFileSync("integration-instructions.md", instructions);
    console.log(
      "✅ Instructions d'intégration créées: integration-instructions.md"
    );

    return instructions;
  }

  // Rapport final
  generateFinalReport() {
    console.log("\n" + "=".repeat(60));
    console.log("📊 RAPPORT DE VALIDATION SYSTÈME COULEURS");
    console.log("=".repeat(60));

    console.log(`✅ Couleurs dans CSV: ${this.colors.length}`);
    console.log(`❌ Erreurs détectées: ${this.errors.length}`);
    console.log(`⚠️ Avertissements: ${this.warnings.length}`);

    if (this.errors.length > 0) {
      console.log("\n🔍 ERREURS:");
      this.errors.forEach((error) => console.log(`  - ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log("\n⚠️ AVERTISSEMENTS:");
      this.warnings.forEach((warning) => console.log(`  - ${warning}`));
    }

    console.log("\n📁 FICHIERS GÉNÉRÉS:");
    console.log("  - test-color-validation.liquid (code de test Shopify)");
    console.log("  - color-mapping-report.json (rapport technique)");
    console.log("  - integration-instructions.md (guide d'intégration)");

    console.log("\n🎯 PROCHAINES ÉTAPES:");
    console.log('1. Créer le metaobject "colors" dans l\'admin Shopify');
    console.log("2. Importer le CSV avec le mapping correct");
    console.log("3. Tester avec test-color-validation.liquid");
    console.log("4. Intégrer product-color-variants.liquid dans vos templates");

    const isValid = this.errors.length === 0;
    console.log(
      `\n${isValid ? "✅ VALIDATION RÉUSSIE" : "❌ VALIDATION ÉCHOUÉE"}: ${
        isValid ? "Système prêt pour l'intégration" : "Corrections nécessaires"
      }`
    );
    console.log("=".repeat(60));

    return isValid;
  }

  // Méthode principale
  async run() {
    console.log("🔍 VALIDATION DU SYSTÈME COULEURS CSS");
    console.log("=====================================\n");

    try {
      await this.validateCSV();
      this.generateLiquidTest();
      this.generateMappingReport();
      this.generateIntegrationInstructions();

      return this.generateFinalReport();
    } catch (error) {
      console.error("💥 Erreur de validation:", error);
      return false;
    }
  }
}

// Exécution
if (require.main === module) {
  const validator = new ColorSystemValidator();
  validator
    .run()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch(console.error);
}

module.exports = ColorSystemValidator;
