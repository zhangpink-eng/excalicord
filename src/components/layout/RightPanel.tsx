import { type ReactNode } from "react"
import { BeautyPanel } from "@/components/beauty/BeautyPanel"
import { CameraBubbleSettings, type BubbleShape } from "@/components/canvas/CameraBubbleSettings"
import type { BeautySettings } from "@/services/beauty/BeautyFilter"
import type { AvatarPreset } from "@/services/ai/AvatarService"

export interface RightPanelProps {
  beautyEnabled: boolean
  beautySettings: BeautySettings
  onBeautySettingChange: <K extends keyof BeautySettings>(key: K, value: BeautySettings[K]) => void
  onBeautyToggle: () => void
  onBeautyReset: () => void
  // Camera bubble settings
  cameraBubbleShape?: BubbleShape
  cameraBubbleBorderColor?: string
  cameraBubbleBorderWidth?: number
  cameraBubbleBorderRadius?: number
  cameraBubbleSize?: { width: number; height: number }
  onCameraBubbleShapeChange?: (shape: BubbleShape) => void
  onCameraBubbleBorderColorChange?: (color: string) => void
  onCameraBubbleBorderWidthChange?: (width: number) => void
  onCameraBubbleBorderRadiusChange?: (radius: number) => void
  onCameraBubbleSizeChange?: (size: { width: number; height: number }) => void
  onCameraBubblePositionPreset?: (position: { x: number; y: number }) => void
  // AI Avatar settings
  avatarEnabled?: boolean
  avatarPresets?: AvatarPreset[]
  selectedAvatarId?: string | null
  onAvatarToggle?: () => void
  onAvatarSelect?: (presetId: string) => void
}

export function RightPanel({
  beautyEnabled,
  beautySettings,
  onBeautySettingChange,
  onBeautyToggle,
  onBeautyReset,
  cameraBubbleShape = "rounded-rect",
  cameraBubbleBorderColor = "#ffffff",
  cameraBubbleBorderWidth = 3,
  cameraBubbleBorderRadius = 16,
  cameraBubbleSize = { width: 200, height: 150 },
  onCameraBubbleShapeChange,
  onCameraBubbleBorderColorChange,
  onCameraBubbleBorderWidthChange,
  onCameraBubbleBorderRadiusChange,
  onCameraBubbleSizeChange,
  onCameraBubblePositionPreset,
  avatarEnabled = false,
  avatarPresets = [],
  selectedAvatarId = null,
  onAvatarToggle,
  onAvatarSelect,
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

      {/* Camera Bubble Settings */}
      {onCameraBubbleShapeChange && onCameraBubbleBorderColorChange && (
        <section>
          <CameraBubbleSettings
            shape={cameraBubbleShape}
            borderColor={cameraBubbleBorderColor}
            borderWidth={cameraBubbleBorderWidth}
            borderRadius={cameraBubbleBorderRadius}
            size={cameraBubbleSize}
            onShapeChange={onCameraBubbleShapeChange}
            onBorderColorChange={onCameraBubbleBorderColorChange}
            onBorderWidthChange={onCameraBubbleBorderWidthChange}
            onBorderRadiusChange={onCameraBubbleBorderRadiusChange}
            onSizeChange={onCameraBubbleSizeChange!}
            onPositionPreset={onCameraBubblePositionPreset!}
          />
        </section>
      )}

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
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">AI Avatar</h3>
          {onAvatarToggle && (
            <button
              onClick={onAvatarToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                avatarEnabled ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  avatarEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          )}
        </div>
        {avatarEnabled && (
          <>
            <div className="space-y-2">
              {avatarPresets.map((preset) => (
                <AvatarOption
                  key={preset.id}
                  id={preset.id}
                  name={preset.name}
                  selected={selectedAvatarId === preset.id}
                  onSelect={onAvatarSelect}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Avatar will appear in camera bubble when enabled
            </p>
          </>
        )}
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

function AvatarOption({
  id,
  name,
  selected = false,
  onSelect,
}: {
  id: string
  name: string
  selected?: boolean
  onSelect?: (id: string) => void
}) {
  return (
    <label
      className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
        selected ? "bg-primary/10 text-primary" : "hover:bg-muted"
      }`}
      onClick={() => onSelect?.(id)}
    >
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
        {name[0]}
      </div>
      <span className="text-sm flex-1">{name}</span>
      <div className="w-4 h-4 rounded-full border border-muted-foreground/30 flex items-center justify-center">
        <div className={`w-2 h-2 rounded-full bg-primary transition-opacity ${selected ? "opacity-100" : "opacity-0"}`} />
      </div>
    </label>
  )
}
