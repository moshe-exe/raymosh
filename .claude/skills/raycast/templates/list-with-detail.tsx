import { List, Detail, ActionPanel, Action, Icon } from "@raycast/api";

interface Item {
  id: string;
  title: string;
  content: string;
}

const items: Item[] = [
  { id: "1", title: "Item 1", content: "# Item 1\n\nDetailed content here." },
  { id: "2", title: "Item 2", content: "# Item 2\n\nDetailed content here." },
];

export default function Command() {
  return (
    <List isShowingDetail searchBarPlaceholder="Search items...">
      {items.map((item) => (
        <List.Item
          key={item.id}
          title={item.title}
          icon={Icon.Document}
          detail={<List.Item.Detail markdown={item.content} />}
          actions={
            <ActionPanel>
              <Action.Push
                title="View Full"
                icon={Icon.Eye}
                target={<Detail markdown={item.content} />}
              />
              <Action.CopyToClipboard
                title="Copy Content"
                content={item.content}
                shortcut={{ modifiers: ["cmd"], key: "c" }}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
