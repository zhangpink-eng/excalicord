import { type ReactNode } from "react"
import { BeautyPanel } from "@/components/beauty/BeautyPanel"
import type { BeautySettings } from "@/services/beauty/BeautyFilter"

export interface RightPanelProps {
  beautyEnabled: boolean
  beautySettings: BeautySettings
  onBeautySettingChange: <K extends keyof BeautySettings>(key: K, value: BeautySettings[K]) => void
  onBeautyToggle: () => void
  onBeautyReset: () => void
}

export function RightPanel({
  beautyEnabled,
  beautySettings,
  onBeautySettingChange,
  onBeautyToggle,
  onBeautyReset,
}: RightPanelProps) {
  return (
    <div className="p-4 space-y-6">
      <section>
        <h3 className="font-semibold text-sm mb-4">Tools</h3>
        <div className="space-y-1">
          <ToolButton icon="pencil" label="Draw" active />
          <ToolButton icon="type" label="Text" />
          <ToolButton icon="square" label="Shapes" />
          <ToolButton icon="image" label="Image" />
        </div>
      </section>

      <section>
        <BeautyPanel
          settings={beautySettings}
          isEnabled={beautyEnabled}
          onSettingChange={onBeautySettingChange}
          onToggle={onBeautyToggle}
          onReset={onBeautyReset}
        />
      </section>

      <section>
        <h3 className="font-semibold text-sm mb-4">AI Avatar</h3>
        <div className="space-y-2">
          <AvatarOption id="alex" name="Alex (Illustrated)" />
          <AvatarOption id="sam" name="Sam (Anime)" />
          <AvatarOption id="jordan" name="Jordan (Realistic)" />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          AI avatars require API configuration
        </p>
      </section>
    </div>
  )
}

function ToolButton({
  icon,
  label,
  active,
}: {
  icon: string
  label: string
  active?: boolean
}): ReactNode {
  const icons: Record<string, ReactNode> = {
    pencil: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      </svg>
    ),
    type: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 7 4 4 20 4 20 7" />
        <line x1="9" x2="15" y1="20" y2="20" />
        <line x1="12" x2="12" y1="4" y2="20" />
      </svg>
    ),
    square: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" />
      </svg>
    ),
    image: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
    ),
  }

  return (
    <button
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "hover:bg-muted text-muted-foreground hover:text-foreground"
      }`}
    >
      {icons[icon]}
      <span>{label}</span>
    </button>
  )
}

function AvatarOption({ id, name }: { id: string; name: string }) {
  return (
    <label className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted cursor-pointer transition-colors">
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
        {name[0]}
      </div>
      <span className="text-sm flex-1">{name}</span>
      <input type="radio" name="avatar" value={id} className="sr-only" />
      <div className="w-4 h-4 rounded-full border border-muted-foreground/30 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-primary opacity-0" />
      </div>
    </label>
  )
}
