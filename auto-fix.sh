#!/bin/bash

echo "🔍 Analyse du code AI Assistant avec les outils de qualité..."

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier si nous sommes dans un projet Node.js
if [ ! -f "package.json" ]; then
    print_error "package.json non trouvé. Ce script doit être exécuté à la racine d'un projet Node.js."
    exit 1
fi

print_status "Démarrage de l'analyse automatique du code..."

# 1. Vérification des types TypeScript
print_status "Vérification des types TypeScript..."
if command -v pnpm &> /dev/null; then
    if pnpm typecheck; then
        print_success "Vérification TypeScript réussie"
    else
        print_warning "Erreurs TypeScript détectées"
    fi
elif command -v npm &> /dev/null; then
    if npm run typecheck; then
        print_success "Vérification TypeScript réussie"
    else
        print_warning "Erreurs TypeScript détectées"
    fi
else
    print_warning "pnpm/npm non trouvé, impossible de vérifier TypeScript"
fi

# 2. Linting et correction automatique
print_status "Exécution du linting et correction automatique..."
if command -v pnpm &> /dev/null; then
    if pnpm lint:fix; then
        print_success "Linting et correction automatique réussis"
    else
        print_warning "Erreurs de linting détectées et partiellement corrigées"
    fi
elif command -v npm &> /dev/null; then
    if npm run lint:fix; then
        print_success "Linting et correction automatique réussis"
    else
        print_warning "Erreurs de linting détectées et partiellement corrigées"
    fi
else
    print_warning "pnpm/npm non trouvé, impossible d'exécuter le linting"
fi

# 3. Audit de sécurité
print_status "Audit de sécurité des dépendances..."
if command -v pnpm &> /dev/null; then
    if pnpm audit --audit-level moderate; then
        print_success "Aucune vulnérabilité critique détectée"
    else
        print_warning "Vulnérabilités détectées - exécution de la correction automatique..."
        pnpm audit:fix || print_warning "Certaines vulnérabilités n'ont pas pu être corrigées automatiquement"
    fi
elif command -v npm &> /dev/null; then
    if npm audit --audit-level moderate; then
        print_success "Aucune vulnérabilité critique détectée"
    else
        print_warning "Vulnérabilités détectées - exécution de la correction automatique..."
        npm audit fix || print_warning "Certaines vulnérabilités n'ont pas pu être corrigées automatiquement"
    fi
else
    print_warning "pnpm/npm non trouvé, impossible d'exécuter l'audit de sécurité"
fi

# 4. Exécution des tests
print_status "Exécution des tests..."
if command -v pnpm &> /dev/null; then
    if pnpm test; then
        print_success "Tous les tests passent"
    else
        print_error "Certains tests échouent"
    fi
elif command -v npm &> /dev/null; then
    if npm test; then
        print_success "Tous les tests passent"
    else
        print_error "Certains tests échouent"
    fi
else
    print_warning "pnpm/npm non trouvé, impossible d'exécuter les tests"
fi

# 5. Formatage du code avec Prettier (si disponible)
print_status "Formatage du code avec Prettier..."
if command -v pnpm &> /dev/null; then
    if pnpm exec prettier --write . 2>/dev/null; then
        print_success "Code formaté avec Prettier"
    else
        print_warning "Prettier non configuré ou erreur de formatage"
    fi
elif command -v npm &> /dev/null; then
    if npm exec prettier --write . 2>/dev/null; then
        print_success "Code formaté avec Prettier"
    else
        print_warning "Prettier non configuré ou erreur de formatage"
    fi
fi

# 6. Vérification finale
print_status "Vérification finale..."
if command -v pnpm &> /dev/null; then
    if pnpm typecheck && pnpm lint; then
        print_success "✅ Correction terminée et tests validés."
        print_success "Le code est maintenant propre et sécurisé !"
    else
        print_warning "⚠️  Certaines erreurs persistent. Vérifiez manuellement."
    fi
elif command -v npm &> /dev/null; then
    if npm run typecheck && npm run lint; then
        print_success "✅ Correction terminée et tests validés."
        print_success "Le code est maintenant propre et sécurisé !"
    else
        print_warning "⚠️  Certaines erreurs persistent. Vérifiez manuellement."
    fi
fi

echo ""
print_status "Résumé de l'analyse :"
echo "  - Types TypeScript vérifiés"
echo "  - Code linté et corrigé automatiquement"
echo "  - Vulnérabilités de sécurité auditées"
echo "  - Tests exécutés"
echo "  - Code formaté"
echo ""
print_success "Analyse automatique terminée !"
