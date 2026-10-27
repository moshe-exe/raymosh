import { List, ActionPanel, Action, Icon } from "@raycast/api";

interface Item {
  id: string;
  title: string;
  subtitle?: string;
}

const items: Item[] = [
  { id: "1", title: "Item 1", subtitle: "Description" },
  { id: "2", title: "Item 2", subtitle: "Description" },
];

export default function Command() {
  return (
    <List searchBarPlaceholder="Search items...">
      {items.map((item) => (
        <List.Item
          key={item.id}
          title={item.title}
          subtitle={item.subtitle}
          icon={Icon.Document}
          actions={
            <ActionPanel>
              <Action.CopyToClipboard title="Copy Title" content={item.title} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
