# Script de déploiement automatisé sur Cloudflare Pages
Write-Host "Deploiement automatique de AI Assistant sur Cloudflare Pages..." -ForegroundColor Blue

# Vérifier si nous sommes dans un projet Node.js
if (-not (Test-Path "package.json")) {
    Write-Host "package.json non trouve. Ce script doit etre execute a la racine d'un projet Node.js." -ForegroundColor Red
    exit 1
}

# Vérifier si wrangler est installé
if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
    Write-Host "npx non trouve. Installez Node.js et npm." -ForegroundColor Red
    exit 1
}

Write-Host "Installation des dependances..." -ForegroundColor Blue
try {
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        pnpm install
    } elseif (Get-Command npm -ErrorAction SilentlyContinue) {
        npm install
    } else {
        Write-Host "pnpm/npm non trouve" -ForegroundColor Red
        exit 1
    }
    Write-Host "Dependances installees" -ForegroundColor Green
} catch {
    Write-Host "Erreur lors de l'installation des dependances: $_" -ForegroundColor Red
    exit 1
}

Write-Host "Build du projet..." -ForegroundColor Blue
try {
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        pnpm build
    } elseif (Get-Command npm -ErrorAction SilentlyContinue) {
        npm run build
    }
    Write-Host "Build termine" -ForegroundColor Green
} catch {
    Write-Host "Erreur lors du build: $_" -ForegroundColor Red
    exit 1
}

Write-Host "Deploiement sur Cloudflare Pages..." -ForegroundColor Blue
try {
    $deployResult = npx wrangler pages deploy build/client 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Deploiement reussi !" -ForegroundColor Green
        
        # Extraire l'URL du déploiement
        $url = ($deployResult | Select-String "https://.*\.pages\.dev").Matches[0].Value
        if ($url) {
            Write-Host "URL du deploiement: $url" -ForegroundColor Cyan
            Write-Host "Ouverture dans le navigateur..." -ForegroundColor Blue
            Start-Process $url
        }
    } else {
        Write-Host "Erreur lors du deploiement: $deployResult" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Erreur lors du deploiement: $_" -ForegroundColor Red
    exit 1
}

Write-Host "Deploiement termine avec succes !" -ForegroundColor Green
Write-Host "Verifiez le statut avec: npx wrangler pages project list" -ForegroundColor Yellow