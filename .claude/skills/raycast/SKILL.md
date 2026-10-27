---
name: raycast
description: Use this skill when implementing features for Raycast extensions, creating new commands, or working with Raycast API components like List, Grid, Form, Detail, Actions, or MenuBarExtra.
allowed-tools: Read, Glob, Grep, Edit, Write, Bash
---

# Raycast Extension Development Skill

You are implementing features for a Raycast extension. Use this guide for API patterns, components, and best practices.

## Development Commands

```bash
npm run dev       # Start development with hot reload
npm run build     # Build for production
npm run lint      # Run ESLint
npm run fix-lint  # Auto-fix linting issues
npm run publish   # Publish to Raycast Store
```

## Extension Structure

Commands are defined in `package.json` under `commands` array:
```json
{
  "commands": [
    {
      "name": "my-command",      // Filename in src/ (without .tsx)
      "title": "My Command",     // Display name
      "subtitle": "Description", // Short description
      "description": "...",      // Full description
      "mode": "view"             // "view" | "no-view" | "menu-bar"
    }
  ]
}
```

Each command exports a default `Command` function component from `src/<name>.tsx`.

## Core UI Components

### List - Filterable list with optional detail pane

```tsx
import { List, ActionPanel, Action, Icon } from "@raycast/api";

export default function Command() {
  return (
    <List
      isLoading={false}
      searchBarPlaceholder="Search items..."
      isShowingDetail={false}  // Enable right-side detail pane
      filtering={true}         // Built-in filtering by title/keywords
      onSearchTextChange={(text) => {}}  // Custom search handling
      onSelectionChange={(id) => {}}     // Selection callback
      searchBarAccessory={<List.Dropdown ... />}
    >
      <List.Section title="Section Title">
        <List.Item
          id="unique-id"
          title="Item Title"
          subtitle="Subtitle"
          icon={Icon.Star}
          keywords={["searchable", "terms"]}
          accessories={[
            { text: "Right text" },
            { icon: Icon.Clock, tooltip: "Tooltip" },
            { tag: { value: "Tag", color: Color.Blue } }
          ]}
          detail={<List.Item.Detail markdown="# Details" />}
          actions={
            <ActionPanel>
              <Action.CopyToClipboard content="..." />
            </ActionPanel>
          }
        />
      </List.Section>
      <List.EmptyView title="No Results" icon={Icon.MagnifyingGlass} />
    </List>
  );
}
```

**List.Item.Detail** - Right-side panel with markdown and metadata:
```tsx
<List.Item.Detail
  markdown="# Markdown Content"
  metadata={
    <List.Item.Detail.Metadata>
      <List.Item.Detail.Metadata.Label title="Label" text="Value" />
      <List.Item.Detail.Metadata.Link title="Link" target="https://..." text="Click" />
      <List.Item.Detail.Metadata.TagList title="Tags">
        <List.Item.Detail.Metadata.TagList.Item text="Tag" color={Color.Green} />
      </List.Item.Detail.Metadata.TagList>
      <List.Item.Detail.Metadata.Separator />
    </List.Item.Detail.Metadata>
  }
/>
```

**List.Dropdown** - Search bar filter (⌘P):
```tsx
<List.Dropdown tooltip="Filter" storeValue onChange={(value) => {}}>
  <List.Dropdown.Section title="Options">
    <List.Dropdown.Item title="All" value="all" />
    <List.Dropdown.Item title="Active" value="active" />
  </List.Dropdown.Section>
</List.Dropdown>
```

### Grid - Visual grid layout for images/icons

```tsx
import { Grid, ActionPanel, Action, Color } from "@raycast/api";

export default function Command() {
  return (
    <Grid
      columns={5}                    // 1-8 columns
      inset={Grid.Inset.Large}       // Small | Medium | Large
      aspectRatio="1"                // "1" | "3/2" | "2/3" | "4/3" | "16/9"
      fit={Grid.Fit.Contain}         // Contain | Fill
      isLoading={false}
      searchBarAccessory={<Grid.Dropdown ... />}
    >
      <Grid.Section title="Icons">
        <Grid.Item
          content={{ source: Icon.Star, tintColor: Color.Blue }}
          title="Star"
          subtitle="Icon"
          accessory={{ icon: Icon.Check }}
          actions={<ActionPanel>...</ActionPanel>}
        />
        <Grid.Item content="https://example.com/image.png" />
        <Grid.Item content={{ color: Color.Red }} />  {/* Color block */}
      </Grid.Section>
      <Grid.EmptyView title="No Items" />
    </Grid>
  );
}
```

### Form - User input forms

```tsx
import { Form, ActionPanel, Action, showToast, Toast } from "@raycast/api";

interface FormValues {
  name: string;
  description: string;
  priority: string;
  enabled: boolean;
  date: Date;
  tags: string[];
  file: string[];
}

export default function Command() {
  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Submit" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Description text="Fill out the form below" />

      <Form.TextField
        id="name"
        title="Name"
        placeholder="Enter name"
        defaultValue=""
        error={error}           // Show validation error
        info="Helper text"      // Info tooltip
        storeValue             // Persist across sessions
        autoFocus
      />

      <Form.TextArea
        id="description"
        title="Description"
        placeholder="Enter description"
        enableMarkdown         // Enable markdown preview
      />

      <Form.PasswordField id="secret" title="API Key" />

      <Form.Separator />

      <Form.Dropdown id="priority" title="Priority" defaultValue="medium">
        <Form.Dropdown.Item value="high" title="High" icon={Icon.ExclamationMark} />
        <Form.Dropdown.Item value="medium" title="Medium" />
        <Form.Dropdown.Item value="low" title="Low" />
      </Form.Dropdown>

      <Form.Checkbox id="enabled" title="Options" label="Enable feature" storeValue />

      <Form.DatePicker
        id="date"
        title="Due Date"
        type={Form.DatePicker.Type.DateTime}  // Date | DateTime
        min={new Date()}
      />

      <Form.TagPicker id="tags" title="Tags">
        <Form.TagPicker.Item value="bug" title="Bug" icon={Icon.Bug} />
        <Form.TagPicker.Item value="feature" title="Feature" />
      </Form.TagPicker>

      <Form.FilePicker
        id="file"
        title="Attachment"
        allowMultipleSelection={false}
        canChooseDirectories={false}
      />
    </Form>
  );
}

async function handleSubmit(values: FormValues) {
  await showToast({ style: Toast.Style.Success, title: "Submitted!" });
}
```

### Detail - Markdown content with metadata

```tsx
import { Detail, ActionPanel, Action } from "@raycast/api";

export default function Command() {
  const markdown = `
# Title

Some **markdown** content with [links](https://raycast.com).

![Image](https://example.com/image.png)

\`\`\`typescript
const code = "highlighted";
\`\`\`
`;

  return (
    <Detail
      markdown={markdown}
      isLoading={false}
      navigationTitle="Page Title"
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="Status" text="Active" icon={Icon.Check} />
          <Detail.Metadata.Link title="URL" target="https://..." text="Open" />
          <Detail.Metadata.TagList title="Tags">
            <Detail.Metadata.TagList.Item text="Important" color={Color.Red} />
          </Detail.Metadata.TagList>
          <Detail.Metadata.Separator />
          <Detail.Metadata.Label title="Created" text="2024-01-15" />
        </Detail.Metadata>
      }
      actions={
        <ActionPanel>
          <Action.OpenInBrowser url="https://..." />
        </ActionPanel>
      }
    />
  );
}
```

### MenuBarExtra - Menu bar commands

Set `mode: "menu-bar"` in package.json command definition.

```tsx
import { MenuBarExtra, Icon, open } from "@raycast/api";

export default function Command() {
  return (
    <MenuBarExtra icon={Icon.Globe} title="Status" tooltip="My Extension">
      <MenuBarExtra.Section title="Actions">
        <MenuBarExtra.Item
          title="Open Dashboard"
          icon={Icon.Link}
          shortcut={{ modifiers: ["cmd"], key: "o" }}
          onAction={() => open("https://...")}
        />
        <MenuBarExtra.Submenu title="More Options" icon={Icon.List}>
          <MenuBarExtra.Item title="Option 1" onAction={() => {}} />
          <MenuBarExtra.Item title="Option 2" onAction={() => {}} />
        </MenuBarExtra.Submenu>
      </MenuBarExtra.Section>
      <MenuBarExtra.Section>
        <MenuBarExtra.Item title="Refresh" icon={Icon.ArrowClockwise} />
      </MenuBarExtra.Section>
    </MenuBarExtra>
  );
}
```

## Actions Reference

```tsx
import { ActionPanel, Action, Icon, Keyboard } from "@raycast/api";

<ActionPanel>
  {/* Primary actions */}
  <Action
    title="Custom Action"
    icon={Icon.Star}
    shortcut={{ modifiers: ["cmd"], key: "s" }}
    onAction={() => console.log("Triggered")}
  />

  <Action.OpenInBrowser title="Open URL" url="https://..." />
  <Action.CopyToClipboard title="Copy" content="text to copy" />
  <Action.Paste title="Paste" content="text to paste" />
  <Action.Open title="Open File" target="/path/to/file" application="com.apple.finder" />
  <Action.OpenWith title="Open With..." path="/path/to/file" />
  <Action.ShowInFinder title="Show in Finder" path="/path/to/file" />
  <Action.Trash title="Move to Trash" paths={["/path/to/file"]} />

  {/* Navigation */}
  <Action.Push title="View Details" target={<DetailView />} icon={Icon.Eye} />

  {/* Form submission */}
  <Action.SubmitForm title="Submit" onSubmit={(values) => {}} />

  {/* Quick Look */}
  <Action.ToggleQuickLook shortcut={{ modifiers: ["cmd"], key: "y" }} />

  {/* Date picker */}
  <Action.PickDate title="Pick Date" onChange={(date) => {}} />

  {/* Raycast features */}
  <Action.CreateSnippet title="Create Snippet" snippet={{ name: "...", text: "..." }} />
  <Action.CreateQuicklink title="Create Quicklink" quicklink={{ name: "...", link: "..." }} />

  {/* Destructive actions - use style prop */}
  <Action
    title="Delete"
    icon={Icon.Trash}
    style={Action.Style.Destructive}
    onAction={() => {}}
  />

  {/* Sections for organization */}
  <ActionPanel.Section title="Secondary">
    <Action title="..." onAction={() => {}} />
  </ActionPanel.Section>
</ActionPanel>
```

**Common keyboard shortcuts:**
- `cmd+c` - Copy
- `cmd+o` - Open
- `cmd+shift+c` - Copy (alternate)
- `cmd+enter` - Primary action
- `cmd+k` - Secondary action

## Feedback APIs

```tsx
import { showToast, showHUD, confirmAlert, Toast, Alert } from "@raycast/api";

// Toast - Notifications with optional actions
await showToast({
  style: Toast.Style.Animated,  // Animated | Success | Failure
  title: "Loading...",
  message: "Please wait",
});

// Update toast
const toast = await showToast({ style: Toast.Style.Animated, title: "Processing" });
toast.style = Toast.Style.Success;
toast.title = "Done!";
toast.hide();

// HUD - Brief notification when closing Raycast
await showHUD("Copied to clipboard!");

// Confirm dialog
const confirmed = await confirmAlert({
  title: "Delete Item?",
  message: "This cannot be undone.",
  icon: Icon.Trash,
  primaryAction: {
    title: "Delete",
    style: Alert.ActionStyle.Destructive,
  },
});
if (confirmed) {
  // Proceed with deletion
}
```

## Storage & State

```tsx
import { LocalStorage } from "@raycast/api";
import { useCachedState, useLocalStorage } from "@raycast/utils";

// LocalStorage - Encrypted key-value storage (shared across commands)
await LocalStorage.setItem("key", "value");
const value = await LocalStorage.getItem<string>("key");
await LocalStorage.removeItem("key");
await LocalStorage.clear();
const all = await LocalStorage.allItems();

// useCachedState hook - Persist state across sessions
const [items, setItems] = useCachedState<Item[]>("items", []);

// useLocalStorage hook - Reactive LocalStorage
const { value, setValue, removeValue, isLoading } = useLocalStorage<string>("key", "default");
```

## Data Fetching

```tsx
import { useFetch, useCachedPromise, usePromise } from "@raycast/utils";

// useFetch - Built-in data fetching with caching
const { data, isLoading, error, revalidate } = useFetch<Response>(
  "https://api.example.com/data",
  {
    parseResponse: async (response) => await response.json(),
    initialData: [],
    keepPreviousData: true,
  }
);

// useCachedPromise - Cache any async function
const { data, isLoading } = useCachedPromise(
  async (id: string) => await fetchItem(id),
  [itemId],
  { initialData: null }
);

// usePromise - No caching
const { data, isLoading } = usePromise(
  async () => await fetchData()
);
```

## Preferences

Define in `package.json`:
```json
{
  "preferences": [
    {
      "name": "apiKey",
      "type": "password",
      "required": true,
      "title": "API Key",
      "description": "Your API key"
    },
    {
      "name": "defaultView",
      "type": "dropdown",
      "required": false,
      "title": "Default View",
      "data": [
        { "title": "List", "value": "list" },
        { "title": "Grid", "value": "grid" }
      ]
    }
  ]
}
```

Access in code:
```tsx
import { getPreferenceValues } from "@raycast/api";

interface Preferences {
  apiKey: string;
  defaultView: string;
}

const prefs = getPreferenceValues<Preferences>();
```

## Environment & Utilities

```tsx
import {
  environment,
  getApplications,
  getDefaultApplication,
  getFrontmostApplication,
  open,
  showInFinder,
  trash,
  getSelectedFinderItems,
  getSelectedText,
  Clipboard,
} from "@raycast/api";

// Environment info
environment.extensionName;       // Extension name
environment.commandName;         // Current command
environment.commandMode;         // "view" | "no-view" | "menu-bar"
environment.isDevelopment;       // Dev mode flag
environment.appearance;          // "light" | "dark"
environment.supportPath;         // Extension support directory
environment.assetsPath;          // Extension assets directory

// Check API access (e.g., AI)
if (environment.canAccess(AI)) {
  // Use AI.ask()
}

// Applications
const apps = await getApplications();
const defaultApp = await getDefaultApplication("/path/to/file");
const frontApp = await getFrontmostApplication();

// Open files/URLs
await open("https://raycast.com");
await open("/path/to/file", "com.apple.TextEdit");

// Finder operations
await showInFinder("/path/to/file");
await trash(["/path/to/file"]);

// Selected content
const finderItems = await getSelectedFinderItems();
const selectedText = await getSelectedText();

// Clipboard
await Clipboard.copy("text");
await Clipboard.paste("text");
const text = await Clipboard.readText();
```

## AI Integration (Raycast Pro)

```tsx
import { AI, environment } from "@raycast/api";
import { useAI } from "@raycast/utils";

// Check access first
if (!environment.canAccess(AI)) {
  // Show error or fallback
}

// Direct API call
const result = await AI.ask("Summarize this text: ...", {
  model: "anthropic-claude-sonnet",  // or "openai-gpt-4o", etc.
  creativity: "medium",              // "none" | "low" | "medium" | "high" | "maximum"
});

// useAI hook for streaming
const { data, isLoading } = useAI("Generate a summary of...", {
  model: "anthropic-claude-sonnet",
  stream: true,
});
```

## Common Patterns

### Navigation with Action.Push
```tsx
<Action.Push
  title="View Details"
  target={<ItemDetail item={item} />}
  icon={Icon.Eye}
/>
```

### Pagination
```tsx
<List
  pagination={{
    hasMore: hasNextPage,
    pageSize: 20,
    onLoadMore: () => loadNextPage(),
  }}
>
  {items.map(item => <List.Item key={item.id} ... />)}
</List>
```

### Form with useForm hook
```tsx
import { useForm, FormValidation } from "@raycast/utils";

const { handleSubmit, itemProps } = useForm<FormValues>({
  onSubmit: async (values) => {
    await saveData(values);
  },
  validation: {
    name: FormValidation.Required,
    email: (value) => {
      if (!value?.includes("@")) return "Invalid email";
    },
  },
});

return (
  <Form actions={<ActionPanel><Action.SubmitForm onSubmit={handleSubmit} /></ActionPanel>}>
    <Form.TextField title="Name" {...itemProps.name} />
    <Form.TextField title="Email" {...itemProps.email} />
  </Form>
);
```

### Execute shell commands
```tsx
import { useExec } from "@raycast/utils";

const { data, isLoading } = useExec("git", ["status", "--porcelain"], {
  cwd: "/path/to/repo",
});
```

## Icon Reference

Common icons from `Icon` enum:
- Navigation: `ArrowRight`, `ArrowLeft`, `ArrowUp`, `ArrowDown`, `ChevronRight`
- Actions: `Plus`, `Minus`, `Trash`, `Pencil`, `Download`, `Upload`, `Clipboard`
- Status: `Check`, `Xmark`, `ExclamationMark`, `QuestionMark`, `Info`
- Objects: `Document`, `Folder`, `Image`, `Link`, `Globe`, `Star`, `Heart`
- UI: `List`, `Grid`, `Sidebar`, `MagnifyingGlass`, `Filter`, `Gear`

## Color Reference

Colors from `Color` enum:
- `PrimaryText`, `SecondaryText`
- `Red`, `Orange`, `Yellow`, `Green`, `Blue`, `Purple`, `Magenta`

For complete API details, see [Raycast API Reference](https://developers.raycast.com/api-reference).

## Templates

When creating new commands, read the appropriate template from the templates folder:

| Template | Use Case | Path |
|----------|----------|------|
| List | Simple searchable list | `.claude/skills/raycast/templates/list-command.tsx` |
| List with Detail | List with right-side detail pane + full view | `.claude/skills/raycast/templates/list-with-detail.tsx` |
| Grid | Visual grid layout with icons/images | `.claude/skills/raycast/templates/grid-command.tsx` |
| Form | User input forms | `.claude/skills/raycast/templates/form-command.tsx` |
| Config-driven List | List powered by external JSON config | `.claude/skills/raycast/templates/config-driven-list.tsx` |
| No-view | Background command without UI | `.claude/skills/raycast/templates/no-view-command.ts` |

Read the template file before creating new commands to ensure consistent patterns.
