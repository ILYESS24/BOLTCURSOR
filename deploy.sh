#!/bin/bash

# Script de déploiement automatisé sur Cloudflare Pages (Linux/macOS)
echo "🚀 Déploiement automatique de AI Assistant sur Cloudflare Pages..."

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Vérifier si nous sommes dans un projet Node.js
if [ ! -f "package.json" ]; then
    print_error "package.json non trouvé. Ce script doit être exécuté à la racine d'un projet Node.js."
    exit 1
fi

# Vérifier si npx est disponible
if ! command -v npx &> /dev/null; then
    print_error "npx non trouvé. Installez Node.js et npm."
    exit 1
fi

print_status "Installation des dépendances..."
if command -v pnpm &> /dev/null; then
    pnpm install
elif command -v npm &> /dev/null; then
    npm install
else
    print_error "pnpm/npm non trouvé"
    exit 1
fi

if [ $? -eq 0 ]; then
    print_success "Dépendances installées"
else
    print_error "Erreur lors de l'installation des dépendances"
    exit 1
fi

print_status "Build du projet..."
if command -v pnpm &> /dev/null; then
    pnpm build
elif command -v npm &> /dev/null; then
    npm run build
fi

if [ $? -eq 0 ]; then
    print_success "Build terminé"
else
    print_error "Erreur lors du build"
    exit 1
fi

print_status "Déploiement sur Cloudflare Pages..."
deploy_output=$(npx wrangler pages deploy build/client 2>&1)
deploy_exit_code=$?

if [ $deploy_exit_code -eq 0 ]; then
    print_success "Déploiement réussi !"
    
    # Extraire l'URL du déploiement
    url=$(echo "$deploy_output" | grep -o 'https://[^[:space:]]*\.pages\.dev' | head -1)
    if [ ! -z "$url" ]; then
        echo -e "${CYAN}🌍 URL du déploiement: $url${NC}"
        echo -e "${BLUE}🔗 Ouvrir dans le navigateur...${NC}"
        
        # Ouvrir l'URL dans le navigateur (Linux/macOS)
        if command -v xdg-open &> /dev/null; then
            xdg-open "$url"
        elif command -v open &> /dev/null; then
            open "$url"
        fi
    fi
else
    print_error "Erreur lors du déploiement: $deploy_output"
    exit 1
fi

print_success "🎉 Déploiement terminé avec succès !"
print_warning "📊 Vérifiez le statut avec: npx wrangler pages project list"
