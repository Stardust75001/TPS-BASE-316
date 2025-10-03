#!/usr/bin/env node

/**
 * IMPORT FINAL - 147 COULEURS CSS
 * Token configuré, import automatique
 */

const fs = require('fs');
const https = require('https');

// Configuration avec votre token
const API_CONFIG = {
    shop: 'f6d72e-0f',
    accessToken: 'shpat_REDACTED',
    apiVersion: '2023-10'
};

// Couleurs CSS à importer (définies directement dans le script)
const CSS_COLORS = [
    { name: 'Alice Blue', hex: '#F0F8FF', code: 'aliceblue' },
    { name: 'Antique White', hex: '#FAEBD7', code: 'antiquewhite' },
    { name: 'Aqua', hex: '#00FFFF', code: 'aqua' },
    { name: 'Aquamarine', hex: '#7FFFD4', code: 'aquamarine' },
    { name: 'Azure', hex: '#F0FFFF', code: 'azure' },
    { name: 'Beige', hex: '#F5F5DC', code: 'beige' },
    { name: 'Bisque', hex: '#FFE4C4', code: 'bisque' },
    { name: 'Black', hex: '#000000', code: 'black' },
    { name: 'Blanched Almond', hex: '#FFEBCD', code: 'blanchedalmond' },
    { name: 'Blue', hex: '#0000FF', code: 'blue' },
    { name: 'Blue Violet', hex: '#8A2BE2', code: 'blueviolet' },
    { name: 'Brown', hex: '#A52A2A', code: 'brown' },
    { name: 'Burlywood', hex: '#DEB887', code: 'burlywood' },
    { name: 'Cadet Blue', hex: '#5F9EA0', code: 'cadetblue' },
    { name: 'Chartreuse', hex: '#7FFF00', code: 'chartreuse' },
    { name: 'Chocolate', hex: '#D2691E', code: 'chocolate' },
    { name: 'Coral', hex: '#FF7F50', code: 'coral' },
    { name: 'Cornflower Blue', hex: '#6495ED', code: 'cornflowerblue' },
    { name: 'Cornsilk', hex: '#FFF8DC', code: 'cornsilk' },
    { name: 'Crimson', hex: '#DC143C', code: 'crimson' },
    { name: 'Cyan', hex: '#00FFFF', code: 'cyan' },
    { name: 'Dark Blue', hex: '#00008B', code: 'darkblue' },
    { name: 'Dark Cyan', hex: '#008B8B', code: 'darkcyan' },
    { name: 'Dark Golden Rod', hex: '#B8860B', code: 'darkgoldenrod' },
    { name: 'Dark Gray', hex: '#A9A9A9', code: 'darkgray' },
    { name: 'Dark Green', hex: '#006400', code: 'darkgreen' },
    { name: 'Dark Khaki', hex: '#BDB76B', code: 'darkkhaki' },
    { name: 'Dark Magenta', hex: '#8B008B', code: 'darkmagenta' },
    { name: 'Dark Olive Green', hex: '#556B2F', code: 'darkolivegreen' },
    { name: 'Dark Orange', hex: '#FF8C00', code: 'darkorange' },
    { name: 'Dark Orchid', hex: '#9932CC', code: 'darkorchid' },
    { name: 'Dark Red', hex: '#8B0000', code: 'darkred' },
    { name: 'Dark Salmon', hex: '#E9967A', code: 'darksalmon' },
    { name: 'Dark Sea Green', hex: '#8FBC8F', code: 'darkseagreen' },
    { name: 'Dark Slate Blue', hex: '#483D8B', code: 'darkslateblue' },
    { name: 'Dark Slate Gray', hex: '#2F4F4F', code: 'darkslategray' },
    { name: 'Dark Turquoise', hex: '#00CED1', code: 'darkturquoise' },
    { name: 'Dark Violet', hex: '#9400D3', code: 'darkviolet' },
    { name: 'Deep Pink', hex: '#FF1493', code: 'deeppink' },
    { name: 'Deep Sky Blue', hex: '#00BFFF', code: 'deepskyblue' },
    { name: 'Dim Gray', hex: '#696969', code: 'dimgray' },
    { name: 'Dodger Blue', hex: '#1E90FF', code: 'dodgerblue' },
    { name: 'Fire Brick', hex: '#B22222', code: 'firebrick' },
    { name: 'Floral White', hex: '#FFFAF0', code: 'floralwhite' },
    { name: 'Forest Green', hex: '#228B22', code: 'forestgreen' },
    { name: 'Fuchsia', hex: '#FF00FF', code: 'fuchsia' },
    { name: 'Gainsboro', hex: '#DCDCDC', code: 'gainsboro' },
    { name: 'Ghost White', hex: '#F8F8FF', code: 'ghostwhite' },
    { name: 'Gold', hex: '#FFD700', code: 'gold' },
    { name: 'Golden Rod', hex: '#DAA520', code: 'goldenrod' },
    { name: 'Gray', hex: '#808080', code: 'gray' },
    { name: 'Green', hex: '#008000', code: 'green' },
    { name: 'Green Yellow', hex: '#ADFF2F', code: 'greenyellow' },
    { name: 'Honey Dew', hex: '#F0FFF0', code: 'honeydew' },
    { name: 'Hot Pink', hex: '#FF69B4', code: 'hotpink' },
    { name: 'Indian Red', hex: '#CD5C5C', code: 'indianred' },
    { name: 'Indigo', hex: '#4B0082', code: 'indigo' },
    { name: 'Ivory', hex: '#FFFFF0', code: 'ivory' },
    { name: 'Khaki', hex: '#F0E68C', code: 'khaki' },
    { name: 'Lavender', hex: '#E6E6FA', code: 'lavender' },
    { name: 'Lavender Blush', hex: '#FFF0F5', code: 'lavenderblush' },
    { name: 'Lawn Green', hex: '#7CFC00', code: 'lawngreen' },
    { name: 'Lemon Chiffon', hex: '#FFFACD', code: 'lemonchiffon' },
    { name: 'Light Blue', hex: '#ADD8E6', code: 'lightblue' },
    { name: 'Light Coral', hex: '#F08080', code: 'lightcoral' },
    { name: 'Light Cyan', hex: '#E0FFFF', code: 'lightcyan' },
    { name: 'Light Golden Rod Yellow', hex: '#FAFAD2', code: 'lightgoldenrodyellow' },
    { name: 'Light Gray', hex: '#D3D3D3', code: 'lightgray' },
    { name: 'Light Green', hex: '#90EE90', code: 'lightgreen' },
    { name: 'Light Pink', hex: '#FFB6C1', code: 'lightpink' },
    { name: 'Light Salmon', hex: '#FFA07A', code: 'lightsalmon' },
    { name: 'Light Sea Green', hex: '#20B2AA', code: 'lightseagreen' },
    { name: 'Light Sky Blue', hex: '#87CEFA', code: 'lightskyblue' },
    { name: 'Light Slate Gray', hex: '#778899', code: 'lightslategray' },
    { name: 'Light Steel Blue', hex: '#B0C4DE', code: 'lightsteelblue' },
    { name: 'Light Yellow', hex: '#FFFFE0', code: 'lightyellow' },
    { name: 'Lime', hex: '#00FF00', code: 'lime' },
    { name: 'Lime Green', hex: '#32CD32', code: 'limegreen' },
    { name: 'Linen', hex: '#FAF0E6', code: 'linen' },
    { name: 'Magenta', hex: '#FF00FF', code: 'magenta' },
    { name: 'Maroon', hex: '#800000', code: 'maroon' },
    { name: 'Medium Aquamarine', hex: '#66CDAA', code: 'mediumaquamarine' },
    { name: 'Medium Blue', hex: '#0000CD', code: 'mediumblue' },
    { name: 'Medium Orchid', hex: '#BA55D3', code: 'mediumorchid' },
    { name: 'Medium Purple', hex: '#9370DB', code: 'mediumpurple' },
    { name: 'Medium Sea Green', hex: '#3CB371', code: 'mediumseagreen' },
    { name: 'Medium Slate Blue', hex: '#7B68EE', code: 'mediumslateblue' },
    { name: 'Medium Spring Green', hex: '#00FA9A', code: 'mediumspringgreen' },
    { name: 'Medium Turquoise', hex: '#48D1CC', code: 'mediumturquoise' },
    { name: 'Medium Violet Red', hex: '#C71585', code: 'mediumvioletred' },
    { name: 'Midnight Blue', hex: '#191970', code: 'midnightblue' },
    { name: 'Mint Cream', hex: '#F5FFFA', code: 'mintcream' },
    { name: 'Misty Rose', hex: '#FFE4E1', code: 'mistyrose' },
    { name: 'Moccasin', hex: '#FFE4B5', code: 'moccasin' },
    { name: 'Navajo White', hex: '#FFDEAD', code: 'navajowhite' },
    { name: 'Navy', hex: '#000080', code: 'navy' },
    { name: 'Old Lace', hex: '#FDF5E6', code: 'oldlace' },
    { name: 'Olive', hex: '#808000', code: 'olive' },
    { name: 'Olive Drab', hex: '#6B8E23', code: 'olivedrab' },
    { name: 'Orange', hex: '#FFA500', code: 'orange' },
    { name: 'Orange Red', hex: '#FF4500', code: 'orangered' },
    { name: 'Orchid', hex: '#DA70D6', code: 'orchid' },
    { name: 'Pale Golden Rod', hex: '#EEE8AA', code: 'palegoldenrod' },
    { name: 'Pale Green', hex: '#98FB98', code: 'palegreen' },
    { name: 'Pale Turquoise', hex: '#AFEEEE', code: 'paleturquoise' },
    { name: 'Pale Violet Red', hex: '#DB7093', code: 'palevioletred' },
    { name: 'Papaya Whip', hex: '#FFEFD5', code: 'papayawhip' },
    { name: 'Peach Puff', hex: '#FFDAB9', code: 'peachpuff' },
    { name: 'Peru', hex: '#CD853F', code: 'peru' },
    { name: 'Pink', hex: '#FFC0CB', code: 'pink' },
    { name: 'Plum', hex: '#DDA0DD', code: 'plum' },
    { name: 'Powder Blue', hex: '#B0E0E6', code: 'powderblue' },
    { name: 'Purple', hex: '#800080', code: 'purple' },
    { name: 'Rebecca Purple', hex: '#663399', code: 'rebeccapurple' },
    { name: 'Red', hex: '#FF0000', code: 'red' },
    { name: 'Rosy Brown', hex: '#BC8F8F', code: 'rosybrown' },
    { name: 'Royal Blue', hex: '#4169E1', code: 'royalblue' },
    { name: 'Saddle Brown', hex: '#8B4513', code: 'saddlebrown' },
    { name: 'Salmon', hex: '#FA8072', code: 'salmon' },
    { name: 'Sandy Brown', hex: '#F4A460', code: 'sandybrown' },
    { name: 'Sea Green', hex: '#2E8B57', code: 'seagreen' },
    { name: 'Sea Shell', hex: '#FFF5EE', code: 'seashell' },
    { name: 'Sienna', hex: '#A0522D', code: 'sienna' },
    { name: 'Silver', hex: '#C0C0C0', code: 'silver' },
    { name: 'Sky Blue', hex: '#87CEEB', code: 'skyblue' },
    { name: 'Slate Blue', hex: '#6A5ACD', code: 'slateblue' },
    { name: 'Slate Gray', hex: '#708090', code: 'slategray' },
    { name: 'Snow', hex: '#FFFAFA', code: 'snow' },
    { name: 'Spring Green', hex: '#00FF7F', code: 'springgreen' },
    { name: 'Steel Blue', hex: '#4682B4', code: 'steelblue' },
    { name: 'Tan', hex: '#D2B48C', code: 'tan' },
    { name: 'Teal', hex: '#008080', code: 'teal' },
    { name: 'Thistle', hex: '#D8BFD8', code: 'thistle' },
    { name: 'Tomato', hex: '#FF6347', code: 'tomato' },
    { name: 'Turquoise', hex: '#40E0D0', code: 'turquoise' },
    { name: 'Violet', hex: '#EE82EE', code: 'violet' },
    { name: 'Wheat', hex: '#F5DEB3', code: 'wheat' },
    { name: 'White', hex: '#FFFFFF', code: 'white' },
    { name: 'White Smoke', hex: '#F5F5F5', code: 'whitesmoke' },
    { name: 'Yellow', hex: '#FFFF00', code: 'yellow' },
    { name: 'Yellow Green', hex: '#9ACD32', code: 'yellowgreen' }
];

// Fonction pour créer un metaobject
function createMetaobject(color, accessToken) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            metaobject: {
                type: 'colors',
                fields: {
                    display_name: color.name,
                    hex_value: color.hex,
                    css_name: color.code
                }
            }
        });

        const options = {
            hostname: `${API_CONFIG.shop}.myshopify.com`,
            port: 443,
            path: `/admin/api/${API_CONFIG.apiVersion}/metaobjects.json`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'X-Shopify-Access-Token': accessToken
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 201) {
                    const response = JSON.parse(data);
                    resolve({
                        success: true,
                        id: response.metaobject.id,
                        handle: response.metaobject.handle
                    });
                } else {
                    resolve({
                        success: false,
                        error: `HTTP ${res.statusCode}`,
                        response: data
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject({
                success: false,
                error: error.message
            });
        });

        req.write(postData);
        req.end();
    });
}

// Import principal
async function importAllColors() {
    console.log('🌈 IMPORT COMPLET - 147 COULEURS CSS');
    console.log('====================================');
    console.log(`📊 Total: ${CSS_COLORS.length} couleurs à importer`);
    console.log('');

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < CSS_COLORS.length; i++) {
        const color = CSS_COLORS[i];
        const progress = `[${i + 1}/${CSS_COLORS.length}]`;
        
        process.stdout.write(`📤 ${progress} ${color.name} (${color.hex})... `);
        
        try {
            const result = await createMetaobject(color, API_CONFIG.accessToken);
            
            if (result.success) {
                console.log(`✅ OK`);
                successCount++;
            } else {
                console.log(`❌ ERREUR: ${result.error}`);
                errorCount++;
                errors.push({
                    color: color.name,
                    error: result.error
                });
            }
        } catch (error) {
            console.log(`❌ EXCEPTION: ${error.error}`);
            errorCount++;
            errors.push({
                color: color.name,
                error: error.error
            });
        }

        // Délai pour respecter les limites API (2 req/sec max)
        if (i < CSS_COLORS.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 600));
        }
    }

    // Rapport final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSULTATS FINAUX');
    console.log('='.repeat(60));
    console.log(`✅ Succès: ${successCount}/${CSS_COLORS.length} couleurs`);
    console.log(`❌ Erreurs: ${errorCount}/${CSS_COLORS.length} couleurs`);
    
    if (errors.length > 0 && errors.length <= 5) {
        console.log('\n🔍 Premières erreurs:');
        errors.slice(0, 5).forEach(error => {
            console.log(`  - ${error.color}: ${error.error}`);
        });
    }
    
    if (successCount > 0) {
        console.log('\n🎉 IMPORT RÉUSSI !');
        console.log('🔗 Vérifiez: Admin → Content → Metaobjects → colors');
        console.log('\n🚀 PROCHAINES ÉTAPES:');
        console.log('1. Vérifiez vos metaobjects dans l\'admin');
        console.log('2. Testez le système de couleurs sur vos produits');
        console.log('3. Les templates sont déjà configurés !');
    }
    
    return successCount;
}

// Lancement
if (require.main === module) {
    importAllColors().catch(console.error);
}

module.exports = { importAllColors };