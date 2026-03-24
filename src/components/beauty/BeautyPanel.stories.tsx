import type { Meta, StoryObj } from "@storybook/react"
import { BeautyPanel } from "./BeautyPanel"
import { defaultBeautySettings } from "@/services/beauty/BeautyFilter"

const meta = {
  title: "Beauty/BeautyPanel",
  component: BeautyPanel,
  tags: ["autodocs"],
} satisfies Meta<typeof BeautyPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    settings: defaultBeautySettings,
    isEnabled: false,
    onSettingChange: (key: string, value: number) => console.log(key, value),
    onToggle: () => console.log("toggled"),
    onReset: () => console.log("reset"),
  },
}

export const Enabled: Story = {
  args: {
    settings: defaultBeautySettings,
    isEnabled: true,
    onSettingChange: (key: string, value: number) => console.log(key, value),
    onToggle: () => console.log("toggled"),
    onReset: () => console.log("reset"),
  },
}

export const CustomSettings: Story = {
  args: {
    settings: {
      smoothing: 70,
      whitening: 50,
      faceSlimming: 30,
      skinTone: 60,
    },
    isEnabled: true,
    onSettingChange: (key: string, value: number) => console.log(key, value),
    onToggle: () => console.log("toggled"),
    onReset: () => console.log("reset"),
  },
}
