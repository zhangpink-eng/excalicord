import { BeautyPanel } from "@/components/beauty/BeautyPanel"
import { CameraBubbleSettings, type BubbleShape } from "@/components/canvas/CameraBubbleSettings"
import type { BeautySettings } from "@/services/beauty/BeautyFilter"
import type { AvatarPreset } from "@/services/ai/AvatarService"

export type AvatarExpression = "neutral" | "happy" | "serious"

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
  avatarLoading?: boolean
  avatarError?: string | null
  avatarPresets?: AvatarPreset[]
  selectedAvatarId?: string | null
  avatarExpression?: AvatarExpression
  avatarScale?: number
  onAvatarToggle?: () => void
  onAvatarSelect?: (presetId: string) => void
  onAvatarExpressionChange?: (expression: AvatarExpression) => void
  onAvatarPositionPreset?: (position: { x: number; y: number }) => void
  onAvatarScaleChange?: (scale: number) => void
  // Media device settings
  cameraEnabled?: boolean
  micEnabled?: boolean
  onCameraToggle?: () => void
  onMicToggle?: () => void
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
  avatarLoading = false,
  avatarError = null,
  avatarPresets = [],
  selectedAvatarId = null,
  avatarExpression = "neutral",
  avatarScale = 1.0,
  onAvatarToggle,
  onAvatarSelect,
  onAvatarExpressionChange,
  onAvatarPositionPreset,
  onAvatarScaleChange,
  cameraEnabled = true,
  micEnabled = true,
  onCameraToggle,
  onMicToggle,
}: RightPanelProps) {
  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-semibold">录制设置</h2>
      </div>

      {/* Media Device Controls */}
      {onCameraToggle && onMicToggle && (
        <section>
          <h3 className="font-semibold text-sm mb-4">Media</h3>
          <div className="flex gap-2">
            <button
              onClick={onCameraToggle}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                cameraEnabled
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill={cameraEnabled ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              Camera
            </button>
            <button
              onClick={onMicToggle}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                micEnabled
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill={micEnabled ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
              Mic
            </button>
          </div>
        </section>
      )}

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
          {onAvatarToggle && !avatarLoading && (
            <button
              onClick={onAvatarToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                avatarEnabled ? "bg-primary" : "bg-muted"
              }`}
              disabled={avatarLoading}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  avatarEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          )}
          {avatarLoading && (
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          )}
        </div>
        {avatarEnabled && !avatarLoading && (
          <>
            {/* Error message */}
            {avatarError && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-md">
                <p className="text-xs text-destructive">{avatarError}</p>
              </div>
            )}

            {/* Avatar Presets */}
            <div className="space-y-2 mb-4">
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

            {/* Expression Selection */}
            {onAvatarExpressionChange && (
              <div className="mb-4">
                <label className="text-xs text-muted-foreground block mb-2">Expression</label>
                <div className="flex gap-1">
                  {(["neutral", "happy", "serious"] as const).map((expr) => (
                    <button
                      key={expr}
                      onClick={() => onAvatarExpressionChange(expr)}
                      className={`flex-1 py-1.5 px-2 text-xs rounded border transition-colors ${
                        avatarExpression === expr
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted hover:bg-muted/80 border-border"
                      }`}
                    >
                      {expr === "neutral" && "😐"}
                      {expr === "happy" && "😊"}
                      {expr === "serious" && "🤨"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Position Presets */}
            {onAvatarPositionPreset && (
              <div>
                <label className="text-xs text-muted-foreground block mb-2">Position</label>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => onAvatarPositionPreset({ x: 0.1, y: 0.1 })}
                    className="py-1.5 px-2 text-xs rounded border bg-muted hover:bg-muted/80 border-border"
                    title="Top Left"
                  >
                    ↖
                  </button>
                  <button
                    onClick={() => onAvatarPositionPreset({ x: 0.5, y: 0.1 })}
                    className="py-1.5 px-2 text-xs rounded border bg-muted hover:bg-muted/80 border-border"
                    title="Top Center"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => onAvatarPositionPreset({ x: 0.9, y: 0.1 })}
                    className="py-1.5 px-2 text-xs rounded border bg-muted hover:bg-muted/80 border-border"
                    title="Top Right"
                  >
                    ↗
                  </button>
                  <button
                    onClick={() => onAvatarPositionPreset({ x: 0.1, y: 0.85 })}
                    className="py-1.5 px-2 text-xs rounded border bg-muted hover:bg-muted/80 border-border"
                    title="Bottom Left"
                  >
                    ↙
                  </button>
                  <button
                    onClick={() => onAvatarPositionPreset({ x: 0.5, y: 0.85 })}
                    className="py-1.5 px-2 text-xs rounded border bg-muted hover:bg-muted/80 border-border"
                    title="Bottom Center"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => onAvatarPositionPreset({ x: 0.9, y: 0.85 })}
                    className="py-1.5 px-2 text-xs rounded border bg-primary/20 hover:bg-primary/30 border-primary text-primary"
                    title="Bottom Right (Default)"
                  >
                    ↘
                  </button>
                </div>
              </div>
            )}

            {/* Size Slider */}
            {onAvatarScaleChange && (
              <div className="mb-4">
                <label className="text-xs text-muted-foreground block mb-2">Size: {Math.round(avatarScale * 100)}%</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={avatarScale}
                  onChange={(e) => onAvatarScaleChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-3">
              Avatar will appear in camera bubble when enabled
            </p>
          </>
        )}
      </section>
    </div>
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
  // Get avatar color based on id
  const getAvatarColor = (avatarId: string) => {
    if (avatarId.includes("alex") || avatarId.includes("1")) return "bg-blue-500"
    if (avatarId.includes("sam") || avatarId.includes("2")) return "bg-pink-500"
    if (avatarId.includes("jordan") || avatarId.includes("3")) return "bg-amber-600"
    return "bg-muted"
  }

  return (
    <label
      className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
        selected ? "bg-primary/10 text-primary" : "hover:bg-muted"
      }`}
      onClick={() => onSelect?.(id)}
    >
      <div className={`w-8 h-8 rounded-full ${getAvatarColor(id)} flex items-center justify-center text-xs font-medium text-white shadow-sm`}>
        {name[0]}
      </div>
      <span className="text-sm flex-1">{name}</span>
      <div className="w-4 h-4 rounded-full border border-muted-foreground/30 flex items-center justify-center">
        <div className={`w-2 h-2 rounded-full bg-primary transition-opacity ${selected ? "opacity-100" : "opacity-0"}`} />
      </div>
    </label>
  )
}
