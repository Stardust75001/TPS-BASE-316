#!/bin/bash

# ===========================================
# Setup Script pour Analytics Configuration
# ===========================================

echo "🚀 Configuration des Analytics - Setup automatisé"
echo

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier si npm est disponible
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas disponible. Veuillez l'installer d'abord."
    exit 1
fi

echo "✅ Node.js et npm détectés"

# Installer dotenv si pas déjà installé
if ! npm list dotenv &> /dev/null; then
    echo "📦 Installation de dotenv..."
    npm install dotenv --save-dev
fi

# Créer le fichier .env s'il n'existe pas
if [ ! -f .env ]; then
    echo "📄 Création du fichier .env depuis le template..."
    cp .env.example .env
    echo "✅ Fichier .env créé"
else
    echo "ℹ️  Le fichier .env existe déjà"
fi

echo
echo "📝 Configuration suivante recommandée:"
echo

# Demander à l'utilisateur ses préférences
read -p "Souhaitez-vous configurer Google Tag Manager ? (y/n): " setup_gtm
if [[ $setup_gtm =~ ^[Yy]$ ]]; then
    read -p "Entrez votre GTM Container ID (GTM-XXXXXXX): " gtm_id
    if [[ $gtm_id =~ ^GTM-[A-Z0-9]+$ ]]; then
        sed -i.bak "s/GTM_CONTAINER_ID=GTM-XXXXXXX/GTM_CONTAINER_ID=$gtm_id/" .env
        echo "✅ GTM ID configuré: $gtm_id"
    else
        echo "⚠️  Format GTM invalide, configuration manuelle nécessaire"
    fi
fi

read -p "Souhaitez-vous configurer Google Analytics 4 ? (y/n): " setup_ga4
if [[ $setup_ga4 =~ ^[Yy]$ ]]; then
    read -p "Entrez votre GA4 Measurement ID (G-XXXXXXXXXX): " ga4_id
    if [[ $ga4_id =~ ^G-[A-Z0-9]+$ ]]; then
        sed -i.bak "s/GA4_MEASUREMENT_ID=G-XXXXXXXXXX/GA4_MEASUREMENT_ID=$ga4_id/" .env
        echo "✅ GA4 ID configuré: $ga4_id"
    else
        echo "⚠️  Format GA4 invalide, configuration manuelle nécessaire"
    fi
fi

read -p "Souhaitez-vous configurer Facebook Pixel ? (y/n): " setup_fb
if [[ $setup_fb =~ ^[Yy]$ ]]; then
    read -p "Entrez votre Facebook Pixel ID (15-16 chiffres): " fb_id
    if [[ $fb_id =~ ^[0-9]{15,16}$ ]]; then
        sed -i.bak "s/FACEBOOK_PIXEL_ID=123456789012345/FACEBOOK_PIXEL_ID=$fb_id/" .env
        echo "✅ Facebook Pixel configuré: $fb_id"
    else
        echo "⚠️  Format Facebook Pixel invalide, configuration manuelle nécessaire"
    fi
fi

read -p "Souhaitez-vous activer Cloudflare Turnstile ? (y/n): " setup_turnstile
if [[ $setup_turnstile =~ ^[Yy]$ ]]; then
    read -p "Entrez votre Turnstile Site Key: " turnstile_key
    sed -i.bak "s/TURNSTILE_SITE_KEY=0x4AAAAAAAAAAAAAAAAAAAAAA/TURNSTILE_SITE_KEY=$turnstile_key/" .env
    sed -i.bak "s/TURNSTILE_ENABLED=false/TURNSTILE_ENABLED=true/" .env
    echo "✅ Turnstile configuré et activé"
fi

# Nettoyer les fichiers de backup
rm -f .env.bak

echo
echo "🔍 Validation de la configuration..."
npm run analytics:validate

if [ $? -eq 0 ]; then
    echo
    echo "✅ Configuration terminée avec succès !"
    echo
    echo "📋 Prochaines étapes:"
    echo "   1. Vérifiez le fichier .env pour les ajustements"
    echo "   2. Testez avec: npm run analytics:validate"
    echo "   3. (Optionnel) Injectez dans le thème: npm run analytics:inject"
    echo "   4. Déployez votre thème"
    echo
    echo "📖 Documentation complète dans README-ANALYTICS-CONFIG.md"
else
    echo
    echo "⚠️  Des erreurs de configuration ont été détectées."
    echo "   Vérifiez le fichier .env et relancez la validation."
fi

echo
echo "🎉 Setup terminé !"
