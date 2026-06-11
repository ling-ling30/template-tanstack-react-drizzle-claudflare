import type { Meta, StoryObj } from "@storybook/react-vite";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const meta = {
  title: "UI/Field",
  component: Field,
  tags: ["autodocs"],
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Field>
      <FieldLabel htmlFor="email">Email</FieldLabel>
      <Input id="email" placeholder="you@example.com" />
    </Field>
  ),
};
