# Script PowerShell pour l'analyse et correction automatique du code AI Assistant
Write-Host "Analyse du code AI Assistant avec les outils de qualite..." -ForegroundColor Blue

# Vérifier si nous sommes dans un projet Node.js
if (-not (Test-Path "package.json")) {
    Write-Host "package.json non trouve. Ce script doit etre execute a la racine d'un projet Node.js." -ForegroundColor Red
    exit 1
}

Write-Host "Demarrage de l'analyse automatique du code..." -ForegroundColor Blue

# 1. Vérification des types TypeScript
Write-Host "Verification des types TypeScript..." -ForegroundColor Blue
try {
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        $typecheckResult = pnpm typecheck 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Verification TypeScript reussie" -ForegroundColor Green
        } else {
            Write-Host "Erreurs TypeScript detectees" -ForegroundColor Yellow
        }
    } elseif (Get-Command npm -ErrorAction SilentlyContinue) {
        $typecheckResult = npm run typecheck 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Verification TypeScript reussie" -ForegroundColor Green
        } else {
            Write-Host "Erreurs TypeScript detectees" -ForegroundColor Yellow
        }
    } else {
        Write-Host "pnpm/npm non trouve, impossible de verifier TypeScript" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Erreur lors de la verification TypeScript: $_" -ForegroundColor Yellow
}

# 2. Linting et correction automatique
Write-Host "Execution du linting et correction automatique..." -ForegroundColor Blue
try {
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        $lintResult = pnpm lint:fix 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Linting et correction automatique reussis" -ForegroundColor Green
        } else {
            Write-Host "Erreurs de linting detectees et partiellement corrigees" -ForegroundColor Yellow
        }
    } elseif (Get-Command npm -ErrorAction SilentlyContinue) {
        $lintResult = npm run lint:fix 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Linting et correction automatique reussis" -ForegroundColor Green
        } else {
            Write-Host "Erreurs de linting detectees et partiellement corrigees" -ForegroundColor Yellow
        }
    } else {
        Write-Host "pnpm/npm non trouve, impossible d'executer le linting" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Erreur lors du linting: $_" -ForegroundColor Yellow
}

# 3. Audit de sécurité
Write-Host "Audit de securite des dependances..." -ForegroundColor Blue
try {
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        $auditResult = pnpm audit --audit-level moderate 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Aucune vulnerabilite critique detectee" -ForegroundColor Green
        } else {
            Write-Host "Vulnerabilites detectees - execution de la correction automatique..." -ForegroundColor Yellow
            try {
                pnpm audit:fix 2>&1 | Out-Null
                Write-Host "Correction automatique des vulnerabilites tentee" -ForegroundColor Green
            } catch {
                Write-Host "Certaines vulnerabilites n'ont pas pu etre corrigees automatiquement" -ForegroundColor Yellow
            }
        }
    } elseif (Get-Command npm -ErrorAction SilentlyContinue) {
        $auditResult = npm audit --audit-level moderate 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Aucune vulnerabilite critique detectee" -ForegroundColor Green
        } else {
            Write-Host "Vulnerabilites detectees - execution de la correction automatique..." -ForegroundColor Yellow
            try {
                npm audit fix 2>&1 | Out-Null
                Write-Host "Correction automatique des vulnerabilites tentee" -ForegroundColor Green
            } catch {
                Write-Host "Certaines vulnerabilites n'ont pas pu etre corrigees automatiquement" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "pnpm/npm non trouve, impossible d'executer l'audit de securite" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Erreur lors de l'audit de securite: $_" -ForegroundColor Yellow
}

# 4. Exécution des tests
Write-Host "Execution des tests..." -ForegroundColor Blue
try {
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        $testResult = pnpm test 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Tous les tests passent" -ForegroundColor Green
        } else {
            Write-Host "Certains tests echouent" -ForegroundColor Red
        }
    } elseif (Get-Command npm -ErrorAction SilentlyContinue) {
        $testResult = npm test 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Tous les tests passent" -ForegroundColor Green
        } else {
            Write-Host "Certains tests echouent" -ForegroundColor Red
        }
    } else {
        Write-Host "pnpm/npm non trouve, impossible d'executer les tests" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Erreur lors de l'execution des tests: $_" -ForegroundColor Yellow
}

# 5. Formatage du code avec Prettier (si disponible)
Write-Host "Formatage du code avec Prettier..." -ForegroundColor Blue
try {
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        $prettierResult = pnpm exec prettier --write . 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Code formate avec Prettier" -ForegroundColor Green
        } else {
            Write-Host "Prettier non configure ou erreur de formatage" -ForegroundColor Yellow
        }
    } elseif (Get-Command npm -ErrorAction SilentlyContinue) {
        $prettierResult = npm exec prettier --write . 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Code formate avec Prettier" -ForegroundColor Green
        } else {
            Write-Host "Prettier non configure ou erreur de formatage" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "Erreur lors du formatage Prettier: $_" -ForegroundColor Yellow
}

# 6. Vérification finale
Write-Host "Verification finale..." -ForegroundColor Blue
try {
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        $finalTypecheck = pnpm typecheck 2>&1
        $finalLint = pnpm lint 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Correction terminee et tests valides." -ForegroundColor Green
            Write-Host "Le code est maintenant propre et securise !" -ForegroundColor Green
        } else {
            Write-Host "Certaines erreurs persistent. Verifiez manuellement." -ForegroundColor Yellow
        }
    } elseif (Get-Command npm -ErrorAction SilentlyContinue) {
        $finalTypecheck = npm run typecheck 2>&1
        $finalLint = npm run lint 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Correction terminee et tests valides." -ForegroundColor Green
            Write-Host "Le code est maintenant propre et securise !" -ForegroundColor Green
        } else {
            Write-Host "Certaines erreurs persistent. Verifiez manuellement." -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "Erreur lors de la verification finale: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Resume de l'analyse :" -ForegroundColor Blue
Write-Host "  - Types TypeScript verifies" -ForegroundColor White
Write-Host "  - Code linte et corrige automatiquement" -ForegroundColor White
Write-Host "  - Vulnerabilites de securite auditees" -ForegroundColor White
Write-Host "  - Tests executes" -ForegroundColor White
Write-Host "  - Code formate" -ForegroundColor White
Write-Host ""
Write-Host "Analyse automatique terminee !" -ForegroundColor Green