import { Grid, ActionPanel, Action, Icon, Color } from "@raycast/api";

interface GridItem {
  id: string;
  title: string;
  icon: Icon;
  color: Color;
}

const items: GridItem[] = [
  { id: "1", title: "Item 1", icon: Icon.Star, color: Color.Blue },
  { id: "2", title: "Item 2", icon: Icon.Heart, color: Color.Red },
];

export default function Command() {
  return (
    <Grid columns={4} inset={Grid.Inset.Medium} searchBarPlaceholder="Search items...">
      {items.map((item) => (
        <Grid.Item
          key={item.id}
          title={item.title}
          content={{ source: item.icon, tintColor: item.color }}
          actions={
            <ActionPanel>
              <Action title="Select" onAction={() => console.log(item.title)} />
            </ActionPanel>
          }
        />
      ))}
    </Grid>
  );
}
