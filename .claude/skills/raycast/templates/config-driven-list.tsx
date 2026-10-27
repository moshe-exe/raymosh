import { useState, useEffect } from "react";
import { List, Detail, ActionPanel, Action, Icon, getPreferenceValues, showToast, Toast } from "@raycast/api";
import { readFileSync, existsSync } from "fs";
import { dirname, resolve } from "path";

interface Preferences {
  configPath?: string;
}

interface Item {
  title: string;
  description?: string;
  file: string;
}

interface Config {
  items: Item[];
}

function loadConfig(configPath: string): Config | null {
  try {
    if (!existsSync(configPath)) return null;
    const content = readFileSync(configPath, "utf-8");
    return JSON.parse(content) as Config;
  } catch (error) {
    console.error("Failed to load config:", error);
    return null;
  }
}

function loadFileContent(configPath: string, filePath: string): string {
  try {
    const configDir = dirname(configPath);
    const fullPath = resolve(configDir, filePath);
    if (!existsSync(fullPath)) return `*File not found: ${filePath}*`;
    return readFileSync(fullPath, "utf-8");
  } catch (error) {
    return `*Error loading file: ${error}*`;
  }
}

export default function Command() {
  const preferences = getPreferenceValues<Preferences>();
  const [config, setConfig] = useState<Config | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contentCache, setContentCache] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!preferences.configPath) {
      showToast({ style: Toast.Style.Failure, title: "No config file", message: "Set config path in preferences" });
      setIsLoading(false);
      return;
    }

    const loadedConfig = loadConfig(preferences.configPath);
    if (loadedConfig) {
      setConfig(loadedConfig);
      const cache: Record<string, string> = {};
      for (const item of loadedConfig.items) {
        cache[item.file] = loadFileContent(preferences.configPath, item.file);
      }
      setContentCache(cache);
    } else {
      showToast({ style: Toast.Style.Failure, title: "Failed to load config" });
    }
    setIsLoading(false);
  }, [preferences.configPath]);

  if (!preferences.configPath || !config) {
    return (
      <List isLoading={isLoading}>
        <List.EmptyView title="No Config" description="Set config path in preferences" icon={Icon.Document} />
      </List>
    );
  }

  return (
    <List isLoading={isLoading} isShowingDetail searchBarPlaceholder="Search...">
      {config.items.map((item, index) => (
        <List.Item
          key={`${item.title}-${index}`}
          title={item.title}
          icon={Icon.Document}
          detail={<List.Item.Detail markdown={contentCache[item.file] || "*Loading...*"} />}
          actions={
            <ActionPanel>
              <Action.Push title="View Document" icon={Icon.Eye} target={<Detail markdown={contentCache[item.file]} />} />
              <Action.CopyToClipboard title="Copy Content" content={contentCache[item.file]} shortcut={{ modifiers: ["cmd"], key: "c" }} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
