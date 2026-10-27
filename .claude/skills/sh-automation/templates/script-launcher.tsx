import { useState, useEffect } from "react";
import { List, ActionPanel, Action, Icon, getPreferenceValues, showToast, showHUD, Toast } from "@raycast/api";
import { exec } from "child_process";
import { promisify } from "util";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const execAsync = promisify(exec);

interface Preferences {
  scriptsConfigPath?: string;
}

interface Script {
  name: string;
  file: string;
  icon?: string;
  description?: string;
}

interface ScriptsConfig {
  scriptsPath: string;
  scripts: Script[];
}

const ICON_MAP: Record<string, Icon> = {
  rocket: Icon.Rocket,
  gear: Icon.Gear,
  terminal: Icon.Terminal,
  folder: Icon.Folder,
  document: Icon.Document,
  globe: Icon.Globe,
  star: Icon.Star,
  code: Icon.Code,
  git: Icon.Circle,
  download: Icon.Download,
  upload: Icon.Upload,
  trash: Icon.Trash,
  refresh: Icon.ArrowClockwise,
  play: Icon.Play,
  stop: Icon.Stop,
  check: Icon.Check,
  xmark: Icon.Xmark,
};

function expandPath(path: string): string {
  if (path.startsWith("~/")) {
    return path.replace("~", process.env.HOME || "");
  }
  return path;
}

function loadConfig(configPath: string): ScriptsConfig | null {
  try {
    const fullPath = expandPath(configPath);
    if (!existsSync(fullPath)) return null;
    const content = readFileSync(fullPath, "utf-8");
    return JSON.parse(content) as ScriptsConfig;
  } catch (error) {
    console.error("Failed to load config:", error);
    return null;
  }
}

function getScriptPath(config: ScriptsConfig, script: Script): string {
  const basePath = expandPath(config.scriptsPath);
  return resolve(basePath, script.file);
}

function getIcon(iconName?: string): Icon {
  if (!iconName) return Icon.Terminal;
  return ICON_MAP[iconName.toLowerCase()] || Icon.Terminal;
}

export default function Command() {
  const preferences = getPreferenceValues<Preferences>();
  const [config, setConfig] = useState<ScriptsConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [runningScripts, setRunningScripts] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!preferences.scriptsConfigPath) {
      showToast({
        style: Toast.Style.Failure,
        title: "No config file",
        message: "Set Scripts Config File in extension preferences",
      });
      setIsLoading(false);
      return;
    }

    const loadedConfig = loadConfig(preferences.scriptsConfigPath);
    if (loadedConfig) {
      setConfig(loadedConfig);
    } else {
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to load config",
        message: "Check that the config file exists and is valid JSON",
      });
    }
    setIsLoading(false);
  }, [preferences.scriptsConfigPath]);

  async function runScript(script: Script) {
    if (!config) return;

    const scriptPath = getScriptPath(config, script);

    if (!existsSync(scriptPath)) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Script not found",
        message: scriptPath,
      });
      return;
    }

    setRunningScripts((prev) => new Set(prev).add(script.name));

    try {
      await showHUD(`Running: ${script.name}...`);
      await execAsync(`chmod +x "${scriptPath}" && "${scriptPath}"`, {
        shell: "/bin/bash",
        env: { ...process.env },
      });
      await showHUD(`Completed: ${script.name}`);
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Script failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setRunningScripts((prev) => {
        const next = new Set(prev);
        next.delete(script.name);
        return next;
      });
    }
  }

  if (!preferences.scriptsConfigPath) {
    return (
      <List>
        <List.EmptyView
          title="No Config File Set"
          description="Set the Scripts Config File path in extension preferences"
          icon={Icon.Terminal}
        />
      </List>
    );
  }

  if (!config) {
    return (
      <List isLoading={isLoading}>
        <List.EmptyView
          title="No Scripts Found"
          description="Add scripts to your scripts-config.json file"
          icon={Icon.Terminal}
        />
      </List>
    );
  }

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search scripts...">
      {config.scripts.map((script, index) => (
        <List.Item
          key={`${script.name}-${index}`}
          title={script.name}
          subtitle={script.description}
          icon={getIcon(script.icon)}
          accessories={[
            runningScripts.has(script.name) ? { icon: Icon.Clock, tooltip: "Running..." } : {},
          ]}
          actions={
            <ActionPanel>
              <Action
                title="Run Script"
                icon={Icon.Play}
                onAction={() => runScript(script)}
              />
              <Action.OpenWith
                title="Edit Script"
                path={getScriptPath(config, script)}
                shortcut={{ modifiers: ["cmd"], key: "e" }}
              />
              <Action.ShowInFinder
                title="Show in Finder"
                path={getScriptPath(config, script)}
                shortcut={{ modifiers: ["cmd"], key: "f" }}
              />
              <Action.CopyToClipboard
                title="Copy Path"
                content={getScriptPath(config, script)}
                shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
