# Script pour désinstaller les fonctionnalités d'auto-fix AI Assistant
Write-Host "Desinstallation des fonctionnalites d'auto-fix AI Assistant..." -ForegroundColor Blue

# Vérifier si nous avons les droits administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if ($isAdmin) {
    # Supprimer la tâche planifiée
    $taskName = "AIAssistantDailyScan"
    try {
        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
        Write-Host "Tache planifiee '$taskName' supprimee avec succes." -ForegroundColor Green
    } catch {
        Write-Host "Aucune tache planifiee a supprimer." -ForegroundColor Yellow
    }
} else {
    Write-Host "Droits administrateur necessaires pour supprimer les taches planifiees." -ForegroundColor Yellow
}

# Supprimer les alias PowerShell (si ils existent)
try {
    Remove-Item alias:fix-code -ErrorAction SilentlyContinue
    Write-Host "Alias 'fix-code' supprime." -ForegroundColor Green
} catch {
    Write-Host "Aucun alias a supprimer." -ForegroundColor Yellow
}

# Optionnel: Supprimer les fichiers de configuration
$removeConfig = Read-Host "Voulez-vous supprimer les fichiers de configuration ? (y/N)"
if ($removeConfig -eq "y" -or $removeConfig -eq "Y") {
    Remove-Item "auto-fix-config.json" -ErrorAction SilentlyContinue
    Remove-Item "auto-fix-and-commit.ps1" -ErrorAction SilentlyContinue
    Remove-Item "setup-daily-scan.ps1" -ErrorAction SilentlyContinue
    Write-Host "Fichiers de configuration supprimes." -ForegroundColor Green
}

Write-Host "Desinstallation AI Assistant terminee !" -ForegroundColor Green
