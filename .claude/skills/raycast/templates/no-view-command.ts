import { showHUD, open } from "@raycast/api";

export default async function Command() {
  // Perform action without UI
  await open("https://example.com");
  await showHUD("Opened example.com");
}
