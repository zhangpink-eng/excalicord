import { useState } from "react"

export type BubbleShape = "rounded-rect" | "circle" | "pill"

export interface CameraBubbleSettingsProps {
  shape: BubbleShape
  borderColor: string
  borderWidth: number
  borderRadius: number
  size: { width: number; height: number }
  onShapeChange?: (shape: BubbleShape) => void
  onBorderColorChange?: (color: string) => void
  onBorderWidthChange?: (width: number) => void
  onBorderRadiusChange?: (radius: number) => void
  onSizeChange?: (size: { width: number; height: number }) => void
  onPositionPreset?: (position: { x: number; y: number }) => void
}

export function CameraBubbleSettings({
  shape,
  borderColor,
  borderWidth,
  borderRadius,
  size,
  onShapeChange,
  onBorderColorChange,
  onBorderWidthChange,
  onBorderRadiusChange,
  onSizeChange,
  onPositionPreset,
}: CameraBubbleSettingsProps) {
  const [activeTab, setActiveTab] = useState<"shape" | "border" | "size" | "position">("shape")

  const shapes: { id: BubbleShape; label: string; preview: React.ReactNode }[] = [
    {
      id: "rounded-rect",
      label: "Rounded",
      preview: (
        <div className="w-8 h-6 rounded-lg border-2 border-current" />
      ),
    },
    {
      id: "circle",
      label: "Circle",
      preview: (
        <div className="w-8 h-8 rounded-full border-2 border-current" />
      ),
    },
    {
      id: "pill",
      label: "Pill",
      preview: (
        <div className="w-8 h-4 rounded-full border-2 border-current" />
      ),
    },
  ]

  const presets = [
    { id: "top-left", label: "Top Left", pos: { x: 20, y: 20 } },
    { id: "top-right", label: "Top Right", pos: { x: 620, y: 20 } },
    { id: "bottom-left", label: "Bottom Left", pos: { x: 20, y: 400 } },
    { id: "bottom-right", label: "Bottom Right", pos: { x: 620, y: 400 } },
    { id: "center", label: "Center", pos: { x: 350, y: 200 } },
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Camera Bubble</h3>
      </div>

      {/* Tab buttons */}
      <div className="flex gap-1 bg-muted rounded p-1">
        {(["shape", "border", "size", "position"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 text-xs py-1 px-2 rounded transition-colors ${
              activeTab === tab
                ? "bg-background shadow-sm font-medium"
                : "hover:bg-background/50"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Shape tab */}
      {activeTab === "shape" && (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            {shapes.map((s) => (
              <button
                key={s.id}
                onClick={() => onShapeChange?.(s.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded border transition-colors ${
                  shape === s.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {s.preview}
                <span className="text-[10px] text-muted-foreground">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Border tab */}
      {activeTab === "border" && (
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Color</span>
            </div>
            <div className="flex gap-2">
              {["#ffffff", "#000000", "#2563eb", "#ef4444", "#10b981"].map((color) => (
                <button
                  key={color}
                  onClick={() => onBorderColorChange?.(color)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    borderColor === color ? "scale-110 border-primary" : "border-muted-foreground/30"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <input
                type="color"
                value={borderColor}
                onChange={(e) => onBorderColorChange?.(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Width</span>
              <span>{borderWidth}px</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={borderWidth}
              onChange={(e) => onBorderWidthChange?.(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          {shape === "rounded-rect" && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Corner Radius</span>
                <span>{borderRadius}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={32}
                value={borderRadius}
                onChange={(e) => onBorderRadiusChange?.(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          )}
        </div>
      )}

      {/* Size tab */}
      {activeTab === "size" && (
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Width</span>
              <span>{size.width}px</span>
            </div>
            <input
              type="range"
              min={80}
              max={400}
              value={size.width}
              onChange={(e) => onSizeChange?.({ ...size, width: Number(e.target.value) })}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Height</span>
              <span>{size.height}px</span>
            </div>
            <input
              type="range"
              min={60}
              max={300}
              value={size.height}
              onChange={(e) => onSizeChange?.({ ...size, height: Number(e.target.value) })}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>
      )}

      {/* Position tab */}
      {activeTab === "position" && (
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onPositionPreset?.(preset.pos)}
              className="text-xs py-2 px-3 rounded border border-border hover:border-primary/50 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
