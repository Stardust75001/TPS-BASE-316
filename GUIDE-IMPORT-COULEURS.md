# 🌈 GUIDE IMPORT MANUEL DES COULEURS CSS

## 📋 **METHOD 1: Rechercher l'option Import dans Shopify**

**Dans votre écran actuel CSS Colors :**

1. **Cherchez un bouton "Import"** en haut de la page
2. **Ou cliquez sur le menu "Actions"** (⋯ ou •••)
3. **Ou regardez dans "More actions"**

Si vous trouvez l'Import :
- Uploadez le fichier `css-colors-import.csv`
- Mappez : Name → display_name, Hex → hex_value, Code → css_name

---

## ✋ **METHOD 2: Import Manuel (Si pas d'option CSV)**

**Ajoutez ces couleurs une par une avec "Add entry" :**

### 🔴 **Couleurs Principales (Ajoutez d'abord ces 10) :**

1. **Blue**
   - Display Name: `Blue`
   - Hex Color Value: `#0000FF`
   - CSS Color Name: `blue`

2. **Green**
   - Display Name: `Green`
   - Hex Color Value: `#008000`
   - CSS Color Name: `green`

3. **Yellow**
   - Display Name: `Yellow`
   - Hex Color Value: `#FFFF00`
   - CSS Color Name: `yellow`

4. **Black**
   - Display Name: `Black`
   - Hex Color Value: `#000000`
   - CSS Color Name: `black`

5. **White**
   - Display Name: `White`
   - Hex Color Value: `#FFFFFF`
   - CSS Color Name: `white`

6. **Orange**
   - Display Name: `Orange`
   - Hex Color Value: `#FFA500`
   - CSS Color Name: `orange`

7. **Purple**
   - Display Name: `Purple`
   - Hex Color Value: `#800080`
   - CSS Color Name: `purple`

8. **Pink**
   - Display Name: `Pink`
   - Hex Color Value: `#FFC0CB`
   - CSS Color Name: `pink`

9. **Gray**
   - Display Name: `Gray`
   - Hex Color Value: `#808080`
   - CSS Color Name: `gray`

10. **Brown**
    - Display Name: `Brown`
    - Hex Color Value: `#A52A2A`
    - CSS Color Name: `brown`

---

## 🚀 **METHOD 3: Script Automatisé**

**Si vous préférez automatiser, exécutez dans votre terminal :**

```bash
cd /Users/asc/Shopify/TPS-BASE-316
node validate-color-system.js
```

---

## 🧪 **ÉTAPE SUIVANTE: Test**

**Une fois que vous avez au moins 5-10 couleurs :**

1. **Allez dans Online Store → Themes**
2. **Éditez votre thème actuel**
3. **Dans `templates/product.liquid`, ajoutez :**
   ```liquid
   {% render 'color-system-test', product: product %}
   ```
4. **Prévisualisez une page produit**

---

## ✅ **Confirmation**

**Dites-moi :**
- ❓ **"Import trouvé"** - si vous avez trouvé l'option Import CSV
- ❓ **"Manuel"** - si vous voulez ajouter manuellement les couleurs
- ❓ **"Script"** - si vous voulez utiliser l'automatisation
- ❓ **"Test"** - si vous voulez passer directement au test avec quelques couleurs
