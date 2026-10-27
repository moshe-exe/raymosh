# IDE Personalize Skill

Expert at making precise edits to VSCode workspace settings across all repositories.

## Settings File Locations

### Mentorium Repositories
- `/Users/mosheojeda/Repositories/mentorium-ai-agents/.vscode/settings.json`
- `/Users/mosheojeda/Repositories/mentorium-ai-backend/.vscode/settings.json`
- `/Users/mosheojeda/Repositories/mentorium-ai-cloud/.vscode/settings.json`
- `/Users/mosheojeda/Repositories/mentorium-ai-docs/.vscode/settings.json`
- `/Users/mosheojeda/Repositories/mentorium-ai-frontend/.vscode/settings.json`
- `/Users/mosheojeda/Repositories/mentorium-ai-staff-portal/.vscode/settings.json`

### Agentman Repositories
- `/Users/mosheojeda/Repositories/agentman-agent-os/.vscode/settings.json`
- `/Users/mosheojeda/Repositories/agentman-airflow-dags/.vscode/settings.json`
- `/Users/mosheojeda/Repositories/agentman-autotest-api/.vscode/settings.json`
- `/Users/mosheojeda/Repositories/agentman-autotest-mf/.vscode/settings.json`
- `/Users/mosheojeda/Repositories/agentman-cloud-functions/.vscode/settings.json`
- `/Users/mosheojeda/Repositories/agentman-cloud-jobs/.vscode/settings.json`
- `/Users/mosheojeda/Repositories/agentman-config/.vscode/settings.json`
- `/Users/mosheojeda/Repositories/agentman-mcp-ecom-server/.vscode/settings.json`
- `/Users/mosheojeda/Repositories/agentman-medman-desktop/.vscode/settings.json`
- `/Users/mosheojeda/Repositories/agentman-platform-app/.vscode/settings.json`

## Common Customizations

### Theme Settings
```json
"workbench.colorTheme": "Monokai"
"workbench.preferredDarkColorTheme": "One Dark Pro"
"workbench.preferredLightColorTheme": "Default Light+"
```

### Title Bar Colors (for workspace identification)
```json
"workbench.colorCustomizations": {
    "titleBar.activeBackground": "#0835a6",
    "titleBar.activeForeground": "#ffffff",
    "titleBar.inactiveBackground": "#0835a6b6",
    "activityBar.background": "#2c0b28"
}
```

### File Exclusions
```json
"files.exclude": {
    "**/__pycache__": true,
    "**/.DS_Store": true,
    "**/.git": true,
    "**/node_modules": true
}
```

### Python Settings
```json
"python.defaultInterpreterPath": "./.venv/bin/python"
"python.analysis.typeCheckingMode": "basic"
"python.analysis.autoImportCompletions": true
"python.linting.enabled": true
"python.formatting.provider": "black"
```

### Editor Settings
```json
"editor.formatOnSave": true
"editor.tabSize": 2
"editor.insertSpaces": true
```

## Workflow

1. **Read first**: Always read the target settings.json files before editing
2. **Batch by project**: Apply changes to all repos in a project group (Mentorium or Agentman) together
3. **Preserve structure**: Maintain existing settings, only modify/add/remove what's requested
4. **Handle missing files**: Some repos may not have .vscode/settings.json - create if needed

## Example Tasks

- "Set Monokai theme on all Mentorium repos"
- "Change title bar color to blue on agentman repos"
- "Enable format on save across all repos"
- "Set Python interpreter path for backend repos"
- "Remove SynthWave84 theme from all settings"
