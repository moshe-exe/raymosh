# Tree Navigator Config Skill

## Config File
Location: `/Users/mosheojeda/Repositories/raymosh/tree-nav-config.json`

## Structure

```json
{
  "root": [TreeNode, ...]
}
```

### TreeNode
```typescript
interface TreeNode {
  label: string;      // Display name
  shortcut: string;   // Keyboard shortcut (hierarchical)
  children?: TreeNode[];  // Makes this a folder
  action?: TreeAction;    // Makes this a leaf (executable)
}
```

### TreeAction
```typescript
interface TreeAction {
  type: "link" | "command";
  value: string;
}
```

| Type | Value | Behavior |
|------|-------|----------|
| `link` | URL | Opens in Microsoft Edge |
| `command` | Shell command | Executes in `/bin/zsh` |

## Shortcut Convention

Shortcuts are hierarchical and build on parent shortcuts:
- Level 1 (project): `m` (Mentorium), `a` (Agentman)
- Level 2 (repo): `mbe` (mentorium-ai-backend), `aos` (agentman-agent-os)
- Level 3 (action): `{repo-shortcut}` + suffix
  - `gh` = GitHub
  - `id` = IDE (Zed)
  - `ac` = Actions
  - `crd` = Cloud Run DEV
  - `crp` = Cloud Run PROD

## Common Patterns

### Add a link leaf
```json
{
  "label": "GitHub",
  "shortcut": "mbegh",
  "action": { "type": "link", "value": "https://github.com/org/repo" }
}
```

### Add a command leaf
```json
{
  "label": "IDE",
  "shortcut": "mbeid",
  "action": { "type": "command", "value": "zed ~/Repositories/repo-name" }
}
```

### Add a clipboard command
```json
{
  "label": "Copy Command",
  "shortcut": "xx",
  "action": { "type": "command", "value": "echo 'command here' | pbcopy" }
}
```

### Add a folder with children
```json
{
  "label": "Project Name",
  "shortcut": "pn",
  "children": [
    { "label": "Child 1", "shortcut": "pn1", "action": {...} }
  ]
}
```

## Icons (automatic in UI)
- Folder: `Icon.ChevronRight` (has children)
- Link: `Icon.Globe` (action type "link")
- Command: `Icon.Terminal` (action type "command")

## Repo Base Path
All repositories are at: `~/Repositories/{repo-name}`
