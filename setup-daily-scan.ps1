# Script pour configurer un scan quotidien automatique AI Assistant
Write-Host "Configuration du scan quotidien automatique AI Assistant..." -ForegroundColor Blue

# Vérifier si nous avons les droits administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "Ce script necessite des droits administrateur pour creer une tache planifiee." -ForegroundColor Red
    Write-Host "Veuillez executer PowerShell en tant qu'administrateur." -ForegroundColor Yellow
    exit 1
}

# Chemin vers le script de correction
$scriptPath = Join-Path $PWD "auto-fix.ps1"
    $taskName = "AIAssistantDailyScan"

# Créer la tâche planifiée
try {
    # Supprimer la tâche existante si elle existe
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
    
    # Créer une nouvelle tâche
    $action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-ExecutionPolicy Bypass -File `"$scriptPath`""
    $trigger = New-ScheduledTaskTrigger -Daily -At "09:00"
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
    
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Description "Scan quotidien automatique du code AI Assistant avec correction des erreurs"
    
    Write-Host "Tache planifiee AI Assistant creee avec succes !" -ForegroundColor Green
    Write-Host "La tache '$taskName' s'executera tous les jours a 09:00" -ForegroundColor Green
    Write-Host "Pour desactiver la tache, utilisez: Unregister-ScheduledTask -TaskName '$taskName'" -ForegroundColor Yellow
    
} catch {
    Write-Host "Erreur lors de la creation de la tache planifiee: $_" -ForegroundColor Red
}

Write-Host "Configuration AI Assistant terminee !" -ForegroundColor Green
