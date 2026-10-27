import { useState, useEffect, useCallback, useMemo } from "react";
import {
  List,
  ActionPanel,
  Action,
  getPreferenceValues,
  showToast,
  Toast,
  open,
  closeMainWindow,
  Icon,
} from "@raycast/api";
import { readFileSync } from "fs";
import { exec } from "child_process";

// Types
interface TreeAction {
  type: "link" | "command";
  value: string;
}

interface TreeNode {
  label: string;
  shortcut: string;
  children?: TreeNode[];
  action?: TreeAction;
}

interface TreeConfig {
  root: TreeNode[];
}

interface Preferences {
  treeConfigPath: string;
}

// Find the deepest matching node and build breadcrumb trail
function findMatchingPath(
  nodes: TreeNode[],
  input: string,
): { breadcrumb: TreeNode[]; currentNodes: TreeNode[]; exactMatch: TreeNode | null } {
  console.log("[findMatchingPath] Input:", input);
  if (!input) {
    console.log("[findMatchingPath] Empty input, returning root nodes");
    return { breadcrumb: [], currentNodes: nodes, exactMatch: null };
  }

  const breadcrumb: TreeNode[] = [];
  let currentNodes = nodes;
  let exactMatch: TreeNode | null = null;

  // Keep drilling down while we find exact matches
  while (true) {
    const match = currentNodes.find((n) => input.toLowerCase().startsWith(n.shortcut.toLowerCase()));

    if (!match) {
      // No match found - filter current nodes by partial match
      const filtered = currentNodes.filter((n) => n.shortcut.toLowerCase().startsWith(input.toLowerCase()));
      return { breadcrumb, currentNodes: filtered, exactMatch: null };
    }

    // Check if this is an exact match or if input extends beyond this node
    const isExactMatch = input.toLowerCase() === match.shortcut.toLowerCase();

    if (isExactMatch) {
      // Exact match - add to breadcrumb and show children
      breadcrumb.push(match);
      exactMatch = match;
      if (match.children && match.children.length > 0) {
        currentNodes = match.children;
      } else {
        // Leaf node - no children to show
        currentNodes = [];
      }
      break;
    } else if (match.children && match.children.length > 0) {
      // Input extends beyond this node - add to breadcrumb and continue
      breadcrumb.push(match);
      currentNodes = match.children;
      // Continue the loop to find deeper matches
    } else {
      // No children but input extends beyond - this is a partial match on a leaf
      // Show this node if it matches
      breadcrumb.push(match);
      currentNodes = [];
      exactMatch = match;
      break;
    }
  }

  console.log(
    "[findMatchingPath] Result - breadcrumb:",
    breadcrumb.map((n) => n.shortcut),
    "exactMatch:",
    exactMatch?.shortcut,
    "currentNodes:",
    currentNodes.map((n) => n.shortcut),
  );
  return { breadcrumb, currentNodes, exactMatch };
}

async function openInEdge(url: string): Promise<void> {
  try {
    await open(url, "com.microsoft.edgemac");
    await showToast({ style: Toast.Style.Success, title: "Opened in Edge" });
  } catch {
    exec(`open -a "Microsoft Edge" "${url}"`, (err) => {
      if (err) {
        showToast({ style: Toast.Style.Failure, title: "Failed to open URL", message: String(err) });
      }
    });
  }
}

async function executeShellCommand(command: string): Promise<void> {
  const wrappedCommand = `/bin/zsh -l -c '${command.replace(/'/g, "'\\''")}'`;
  console.log("[executeShellCommand] Original command:", command);
  console.log("[executeShellCommand] Wrapped command:", wrappedCommand);
  await closeMainWindow();
  // Use login shell (-l) to load user's PATH from .zprofile/.zshrc
  exec(wrappedCommand, (error, stdout, stderr) => {
    if (error) {
      console.error("[executeShellCommand] Error:", error.message);
      console.error("[executeShellCommand] Stderr:", stderr);
      showToast({ style: Toast.Style.Failure, title: "Command failed", message: error.message });
    } else {
      console.log("[executeShellCommand] Success. Stdout:", stdout);
      showToast({ style: Toast.Style.Success, title: "Command executed" });
    }
  });
}

export default function Command() {
  const [searchText, setSearchText] = useState("");
  const [treeData, setTreeData] = useState<TreeNode[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load config on mount
  useEffect(() => {
    const preferences = getPreferenceValues<Preferences>();
    try {
      const content = readFileSync(preferences.treeConfigPath, "utf-8");
      const config: TreeConfig = JSON.parse(content);
      setTreeData(config.root);
    } catch (err) {
      setError(`Failed to load config: ${err}`);
    }
  }, []);

  // Compute breadcrumb and visible nodes
  const { breadcrumb, currentNodes, exactMatch } = useMemo(() => {
    if (!treeData) return { breadcrumb: [], currentNodes: [], exactMatch: null };
    return findMatchingPath(treeData, searchText.trim());
  }, [treeData, searchText]);

  // Build breadcrumb string for display
  const breadcrumbText = breadcrumb.map((n) => n.label).join(" → ");

  // Execute action
  const executeAction = useCallback(async (action: TreeAction) => {
    console.log("[executeAction] Action:", action);
    if (action.type === "link") {
      await openInEdge(action.value);
    } else if (action.type === "command") {
      await executeShellCommand(action.value);
    }
  }, []);

  if (error) {
    return (
      <List>
        <List.EmptyView title="Error" description={error} />
      </List>
    );
  }

  // Check if we have an exact match on a leaf node (actionable)
  const canExecute = exactMatch?.action && (!exactMatch.children || exactMatch.children.length === 0);

  return (
    <List
      searchText={searchText}
      onSearchTextChange={setSearchText}
      filtering={false}
      searchBarPlaceholder="Type shortcuts..."
      navigationTitle={breadcrumbText || "Tree Navigator"}
    >
      {breadcrumbText && (
        <List.Section title={breadcrumbText}>
          {currentNodes.map((node) => {
            const isLeaf = !node.children || node.children.length === 0;
            return (
              <List.Item
                key={node.shortcut}
                id={node.shortcut}
                icon={isLeaf ? (node.action?.type === "link" ? Icon.Globe : Icon.Terminal) : Icon.ChevronRight}
                title={node.label}
                subtitle={`[${node.shortcut}]`}
                actions={
                  <ActionPanel>
                    {isLeaf && node.action && (
                      <Action
                        title={node.action.type === "link" ? "Open in Edge" : "Run Command"}
                        onAction={() => executeAction(node.action!)}
                      />
                    )}
                  </ActionPanel>
                }
              />
            );
          })}
          {currentNodes.length === 0 && canExecute && (
            <List.Item
              key="execute"
              icon={exactMatch!.action!.type === "link" ? Icon.Globe : Icon.Terminal}
              title={`Press Enter to ${exactMatch!.action!.type === "link" ? "open link" : "run command"}`}
              actions={
                <ActionPanel>
                  <Action
                    title={exactMatch!.action!.type === "link" ? "Open in Edge" : "Run Command"}
                    onAction={() => executeAction(exactMatch!.action!)}
                  />
                </ActionPanel>
              }
            />
          )}
        </List.Section>
      )}
      {!breadcrumbText && (
        <List.Section title="Root">
          {currentNodes.map((node) => {
            const isLeaf = !node.children || node.children.length === 0;
            return (
              <List.Item
                key={node.shortcut}
                id={node.shortcut}
                icon={isLeaf ? (node.action?.type === "link" ? Icon.Globe : Icon.Terminal) : Icon.ChevronRight}
                title={node.label}
                subtitle={`[${node.shortcut}]`}
                actions={
                  <ActionPanel>
                    {isLeaf && node.action && (
                      <Action
                        title={node.action.type === "link" ? "Open in Edge" : "Run Command"}
                        onAction={() => executeAction(node.action!)}
                      />
                    )}
                  </ActionPanel>
                }
              />
            );
          })}
        </List.Section>
      )}
    </List>
  );
}
