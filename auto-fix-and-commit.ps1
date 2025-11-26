# Script PowerShell pour l'analyse, correction et commit automatique du code AI Assistant
Write-Host "Analyse du code AI Assistant avec correction et commit automatique..." -ForegroundColor Blue

# Vérifier si nous sommes dans un projet Git
if (-not (Test-Path ".git")) {
    Write-Host "Ce projet n'est pas un depot Git. Initialisation..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit"
}

# Exécuter le script de correction
Write-Host "Execution de l'analyse et correction automatique..." -ForegroundColor Blue
.\auto-fix.ps1

# Vérifier s'il y a des changements
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "Changements detectes. Creation du commit automatique..." -ForegroundColor Blue
    
    # Ajouter tous les fichiers modifiés
    git add .
    
    # Créer un commit avec un message descriptif
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $commitMessage = "AI auto-fix - $timestamp"
    
    git commit -m $commitMessage
    
    Write-Host "Commit cree avec succes: $commitMessage" -ForegroundColor Green
} else {
    Write-Host "Aucun changement detecte. Aucun commit necessaire." -ForegroundColor Yellow
}

Write-Host "Processus termine !" -ForegroundColor Green
