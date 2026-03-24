import type { Meta, StoryObj } from "@storybook/react-vite"
import { ThemeToggle } from "./ThemeToggle"
import { ThemeProvider } from "@/contexts/ThemeContext"

const meta = {
  title: "UI/ThemeToggle",
  component: ThemeToggle,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="p-4">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof ThemeToggle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const DarkMode: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="dark p-4">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
}
