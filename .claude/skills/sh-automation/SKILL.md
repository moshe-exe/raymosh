---
name: sh-automation
description: Use this skill for creating shell script automations and integrating them with applications like Raycast. Covers script patterns, execution methods, and hooks.
allowed-tools: Read, Glob, Grep, Edit, Write, Bash
---

# Shell Automation Skill

Create and manage shell script automations that can be triggered from various sources including Raycast, cron jobs, or other applications.

## Shell Script Best Practices

### Script Header Template

```bash
#!/bin/bash
set -e  # Exit on error

# Description: Brief description of what this script does
# Usage: ./script.sh [optional-args]
```

### Error Handling

```bash
#!/bin/bash
set -e          # Exit immediately on error
set -u          # Treat unset variables as error
set -o pipefail # Pipe fails if any command fails

# Cleanup on exit
cleanup() {
  # Remove temp files, reset state, etc.
  echo "Cleaning up..."
}
trap cleanup EXIT

# Error handler
error_exit() {
  echo "Error: $1" >&2
  exit 1
}

# Usage
command_that_might_fail || error_exit "Command failed"
```

### Logging

```bash
LOG_FILE="${HOME}/.logs/automation.log"
mkdir -p "$(dirname "$LOG_FILE")"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "Starting automation..."
```

### Environment Variables

```bash
# Load from .env file
if [ -f "$HOME/.automations/.env" ]; then
  export $(grep -v '^#' "$HOME/.automations/.env" | xargs)
fi

# With defaults
API_KEY="${API_KEY:-default_value}"
```

## Raycast Integration

### Method 1: No-View Command (Fire and Forget)

Best for scripts that don't need to show output. Uses Node's `child_process`.

```tsx
import { showHUD } from "@raycast/api";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export default async function Command() {
  try {
    await showHUD("Running automation...");
    await execAsync("/path/to/script.sh");
    await showHUD("Done!");
  } catch (error) {
    await showHUD("Failed!");
  }
}
```

### Method 2: useExec Hook (Show Output)

Best when you need to display script output in Raycast UI.

```tsx
import { Detail } from "@raycast/api";
import { useExec } from "@raycast/utils";

export default function Command() {
  const { data, isLoading, error } = useExec("/path/to/script.sh", [], {
    shell: true,
    env: { PATH: process.env.PATH },
  });

  if (error) {
    return <Detail markdown={`## Error\n\`\`\`\n${error.message}\n\`\`\``} />;
  }

  return <Detail isLoading={isLoading} markdown={`## Output\n\`\`\`\n${data || ""}\n\`\`\``} />;
}
```

### Method 3: useExec with Arguments

```tsx
import { useExec } from "@raycast/utils";

const { data, isLoading } = useExec("/path/to/script.sh", ["arg1", "arg2"], {
  shell: true,
  cwd: "/working/directory",
  env: {
    ...process.env,
    CUSTOM_VAR: "value",
  },
});
```

### Method 4: Interactive Execution with Streaming

```tsx
import { useState, useEffect } from "react";
import { Detail } from "@raycast/api";
import { spawn } from "child_process";

export default function Command() {
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    const proc = spawn("/path/to/script.sh", [], { shell: true });

    proc.stdout.on("data", (data) => {
      setOutput((prev) => prev + data.toString());
    });

    proc.stderr.on("data", (data) => {
      setOutput((prev) => prev + `[ERROR] ${data.toString()}`);
    });

    proc.on("close", () => setIsRunning(false));

    return () => proc.kill();
  }, []);

  return <Detail isLoading={isRunning} markdown={`\`\`\`\n${output}\n\`\`\``} />;
}
```

## Script Launcher Pattern

A config-driven Raycast command that lists and runs scripts from a configurable directory.

### Config Structure (scripts-config.json)

```json
{
  "scriptsPath": "~/automations",
  "scripts": [
    {
      "name": "Deploy Production",
      "file": "deploy-prod.sh",
      "icon": "rocket",
      "description": "Deploy to production server"
    },
    {
      "name": "Backup Database",
      "file": "backup-db.sh",
      "icon": "hard-drive",
      "description": "Create database backup"
    }
  ]
}
```

### Raycast preferences (package.json)

```json
{
  "preferences": [
    {
      "name": "scriptsConfigPath",
      "type": "file",
      "required": true,
      "title": "Scripts Config File",
      "description": "Path to scripts-config.json"
    }
  ]
}
```

## Common useExec Options

```tsx
useExec(command, args, {
  shell: true,              // Run in shell (required for most scripts)
  cwd: "/path",             // Working directory
  env: {},                  // Environment variables
  timeout: 30000,           // Timeout in ms
  input: "stdin data",      // Pass to stdin
  encoding: "utf-8",        // Output encoding
  onError: (error) => {},   // Error callback
  onData: (data) => {},     // Stream callback
  execute: true,            // Set false to delay execution
  keepPreviousData: true,   // Keep stale data while reloading
});
```

## Templates

When creating automations, read the appropriate template:

| Template | Use Case | Path |
|----------|----------|------|
| Open Apps/URLs | Launch applications or websites | `.claude/skills/sh-automation/templates/open-apps-urls.sh` |
| Git Operations | Git workflows and commands | `.claude/skills/sh-automation/templates/git-operations.sh` |
| File Manipulation | File/folder operations | `.claude/skills/sh-automation/templates/file-manipulation.sh` |
| API Calls | curl and API interactions | `.claude/skills/sh-automation/templates/api-calls.sh` |
| Script Launcher | Raycast command to run scripts | `.claude/skills/sh-automation/templates/script-launcher.tsx` |

Read the template file before creating new automations to ensure consistent patterns.
