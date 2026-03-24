import type { Meta, StoryObj } from "@storybook/react-vite"
import { SlideThumbnail } from "./SlideThumbnail"

const meta = {
  title: "Slides/SlideThumbnail",
  component: SlideThumbnail,
  tags: ["autodocs"],
  argTypes: {
    isSelected: {
      control: "boolean",
    },
    canDelete: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof SlideThumbnail>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    slide: { id: "1", name: "Slide 1" },
    index: 0,
    isSelected: false,
    canDelete: true,
    onClick: () => console.log("clicked"),
    onDelete: () => console.log("deleted"),
  },
}

export const Selected: Story = {
  args: {
    slide: { id: "1", name: "Slide 1" },
    index: 0,
    isSelected: true,
    canDelete: true,
    onClick: () => console.log("clicked"),
    onDelete: () => console.log("deleted"),
  },
}

export const WithRename: Story = {
  args: {
    slide: { id: "1", name: "Slide 1" },
    index: 0,
    isSelected: false,
    canDelete: true,
    onClick: () => console.log("clicked"),
    onDelete: () => console.log("deleted"),
    onRename: (name: string) => console.log("renamed to", name),
  },
}

export const CannotDelete: Story = {
  args: {
    slide: { id: "1", name: "Slide 1" },
    index: 0,
    isSelected: false,
    canDelete: false,
    onClick: () => console.log("clicked"),
  },
}

export const MultipleSlides: Story = {
  args: {
    slide: { id: "1", name: "Slide 1" },
    index: 0,
    isSelected: true,
    canDelete: true,
    onClick: () => console.log("clicked"),
    onDelete: () => console.log("deleted"),
  },
  render: (args) => (
    <div className="flex gap-2 p-4">
      <SlideThumbnail {...args} />
      <SlideThumbnail
        {...args}
        slide={{ id: "2", name: "Slide 2" }}
        index={1}
        isSelected={false}
      />
      <SlideThumbnail
        slide={{ id: "3", name: "Slide 3" }}
        index={2}
        isSelected={false}
        canDelete={true}
        onClick={() => console.log("clicked 3")}
        onDelete={() => console.log("deleted 3")}
      />
    </div>
  ),
}
