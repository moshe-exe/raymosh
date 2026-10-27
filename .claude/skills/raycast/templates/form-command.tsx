import { Form, ActionPanel, Action, showToast, Toast } from "@raycast/api";

interface FormValues {
  name: string;
  description: string;
  priority: string;
}

export default function Command() {
  async function handleSubmit(values: FormValues) {
    await showToast({
      style: Toast.Style.Success,
      title: "Submitted",
      message: `Name: ${values.name}`,
    });
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Submit" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="name" title="Name" placeholder="Enter name" />
      <Form.TextArea id="description" title="Description" placeholder="Enter description" />
      <Form.Dropdown id="priority" title="Priority" defaultValue="medium">
        <Form.Dropdown.Item value="high" title="High" />
        <Form.Dropdown.Item value="medium" title="Medium" />
        <Form.Dropdown.Item value="low" title="Low" />
      </Form.Dropdown>
    </Form>
  );
}
