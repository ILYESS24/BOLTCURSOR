# 🤖 Auto-Fix - Correction Automatique du Code

Ce système d'auto-correction utilise des outils de qualité de code pour détecter et corriger automatiquement les erreurs dans votre projet.

## 🚀 Installation et Configuration

### Prérequis

- Node.js 18+ avec pnpm ou npm
- PowerShell (Windows) ou Bash (Linux/macOS)
- Git (optionnel, pour les commits automatiques)

### Scripts Disponibles

#### 1. `auto-fix.ps1` (Windows PowerShell)

Script principal pour l'analyse et correction automatique.

**Utilisation :**

```powershell
.\auto-fix.ps1
```

#### 2. `auto-fix.sh` (Linux/macOS)

Version bash du script principal.

**Utilisation :**

```bash
chmod +x auto-fix.sh
./auto-fix.sh
```

#### 3. `auto-fix-and-commit.ps1`

Script qui corrige le code ET fait un commit automatique.

**Utilisation :**

```powershell
.\auto-fix-and-commit.ps1
```

## 🎯 Commandes Rapides

### Alias PowerShell

```powershell
# Créer l'alias (à exécuter une fois)
Set-Alias -Name fix-code -Value ".\auto-fix.ps1"

# Utiliser l'alias
fix-code
```

### Alias Bash (Linux/macOS)

```bash
# Ajouter à ~/.bashrc ou ~/.zshrc
echo 'alias fix-code="./auto-fix.sh"' >> ~/.bashrc
source ~/.bashrc

# Utiliser l'alias
fix-code
```

## 🔧 Fonctionnalités

### Vérifications Automatiques

- ✅ **TypeScript** : Vérification des types
- ✅ **Linting** : Correction automatique avec ESLint
- ✅ **Sécurité** : Audit des vulnérabilités
- ✅ **Tests** : Exécution des tests unitaires
- ✅ **Formatage** : Formatage avec Prettier

### Fonctionnalités Bonus

#### 1. Commit Automatique

```powershell
.\auto-fix-and-commit.ps1
```

- Corrige le code
- Crée un commit automatique avec timestamp
- Message : "AI auto-fix - YYYY-MM-DD HH:mm:ss"

#### 2. Scan Quotidien Automatique

```powershell
# Configurer (nécessite droits administrateur)
.\setup-daily-scan.ps1

# Désinstaller
.\uninstall-auto-fix.ps1
```

## ⚙️ Configuration

### Fichier `auto-fix-config.json`

```json
{
  "autoFix": {
    "enabled": true,
    "checks": {
      "typescript": true,
      "linting": true,
      "security": true,
      "tests": true,
      "formatting": true
    },
    "autoCommit": false,
    "commitMessage": "AI auto-fix - {timestamp}"
  }
}
```

## 📊 Exemple de Sortie

```
🔍 Analyse du code avec les outils de qualité...
Démarrage de l'analyse automatique du code...
Vérification des types TypeScript...
✅ Vérification TypeScript réussie
Exécution du linting et correction automatique...
✅ Linting et correction automatique réussis
Audit de sécurité des dépendances...
✅ Aucune vulnérabilité critique détectée
Exécution des tests...
✅ Tous les tests passent
Formatage du code avec Prettier...
✅ Code formaté avec Prettier
Vérification finale...
✅ Correction terminée et tests validés.
Le code est maintenant propre et sécurisé !

Résumé de l'analyse :
  - Types TypeScript vérifiés
  - Code linté et corrigé automatiquement
  - Vulnérabilités de sécurité auditées
  - Tests exécutés
  - Code formaté

✅ Analyse automatique terminée !
```

## 🛠️ Dépannage

### Problèmes Courants

1. **"pnpm/npm non trouvé"**

   - Installez Node.js et pnpm/npm
   - Vérifiez que les commandes sont dans le PATH

2. **"Droits administrateur nécessaires"**

   - Exécutez PowerShell en tant qu'administrateur
   - Ou utilisez les scripts sans fonctionnalités de tâche planifiée

3. **Erreurs d'encodage (Windows)**
   - Utilisez PowerShell 5.1+ ou PowerShell Core
   - Vérifiez l'encodage des fichiers

### Logs et Debug

Les scripts affichent des messages colorés :

- 🔵 **Bleu** : Informations
- 🟢 **Vert** : Succès
- 🟡 **Jaune** : Avertissements
- 🔴 **Rouge** : Erreurs

## 🔄 Intégration CI/CD

### GitHub Actions

```yaml
- name: Auto-fix code
  run: |
    if [[ "$RUNNER_OS" == "Windows" ]]; then
      .\auto-fix.ps1
    else
      ./auto-fix.sh
    fi
```

### GitLab CI

```yaml
auto-fix:
  script:
    - ./auto-fix.sh
  only:
    - merge_requests
```

## 📝 Notes

- Les scripts sont conçus pour être non-destructifs
- Toujours vérifier les changements avant de commiter
- Les corrections automatiques peuvent nécessiter une révision manuelle
- Compatible avec les projets TypeScript/JavaScript modernes

## 🤝 Contribution

Pour améliorer les scripts :

1. Modifiez les fichiers `.ps1` ou `.sh`
2. Testez avec votre projet
3. Proposez des améliorations

---

**🎉 Votre code est maintenant automatiquement maintenu et sécurisé !**
