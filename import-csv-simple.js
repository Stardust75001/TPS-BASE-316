#!/usr/bin/env node

const fs = require('fs');

console.log('📤 IMPORT CSV SIMPLE VERS METAOBJECTS');
console.log('====================================');

// Lire le CSV
const csvContent = fs.readFileSync('css-colors-import.csv', 'utf8');
const lines = csvContent.split('\n').slice(1, 11); // 10 premières couleurs

console.log('🎨 COULEURS À AJOUTER MANUELLEMENT:');
console.log('==================================');

lines.forEach((line, index) => {
    if (line.trim()) {
        const [name, hex, code] = line.split(',');
        console.log(`\n${index + 1}. Couleur: ${name}`);
        console.log(`   Display Name: ${name}`);
        console.log(`   Hex Value: ${hex}`);
        console.log(`   CSS Name: ${code}`);
        console.log(`   → Admin > Metaobjects > CSS Colors > Add entry`);
    }
});

console.log('\n🚀 INSTRUCTIONS:');
console.log('1. Copiez ces valeurs une par une');
console.log('2. Admin > Content > Metaobjects > CSS Colors');
console.log('3. Cliquez "Add entry" pour chaque couleur');
console.log('4. Collez: Display Name, Hex Value, CSS Name');

console.log('\n⚡ COMMANDE DE TEST APRÈS:');
console.log('shopify theme push --only=snippets/color-system-test.liquid');
