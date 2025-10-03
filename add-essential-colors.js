#!/usr/bin/env node

// GUIDE POUR AJOUTER LES COULEURS ESSENTIELLES RAPIDEMENT

const essentialColors = [
    { name: 'Red', hex: '#FF0000', code: 'red' },
    { name: 'Blue', hex: '#0000FF', code: 'blue' },
    { name: 'Green', hex: '#008000', code: 'green' },
    { name: 'Yellow', hex: '#FFFF00', code: 'yellow' },
    { name: 'Black', hex: '#000000', code: 'black' },
    { name: 'White', hex: '#FFFFFF', code: 'white' },
    { name: 'Orange', hex: '#FFA500', code: 'orange' },
    { name: 'Purple', hex: '#800080', code: 'purple' },
    { name: 'Pink', hex: '#FFC0CB', code: 'pink' },
    { name: 'Gray', hex: '#808080', code: 'gray' }
];

console.log('🎨 AJOUT RAPIDE DES 10 COULEURS ESSENTIELLES');
console.log('===========================================');
console.log('');
console.log('📍 URL: https://admin.shopify.com/store/f6d72e-0f/settings/custom_data');
console.log('📁 Cliquez: CSS Colors → Add entry');
console.log('');
console.log('📝 COPIEZ-COLLEZ CES VALEURS UNE PAR UNE:');
console.log('=========================================');

essentialColors.forEach((color, index) => {
    console.log(`\n${index + 1}. 🎨 ${color.name.toUpperCase()}`);
    console.log(`   Display Name: ${color.name}`);
    console.log(`   Hex Value: ${color.hex}`);
    console.log(`   CSS Name: ${color.code}`);
});

console.log('\n⏱️ TEMPS ESTIMÉ: 5-10 minutes');
console.log('🎯 PUIS TESTEZ: shopify theme push --only=snippets/color-system-test.liquid');
console.log('\n💡 Ces 10 couleurs couvrent 80% des besoins e-commerce !');
