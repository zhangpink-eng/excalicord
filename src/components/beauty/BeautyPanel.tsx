import type { BeautySettings } from "@/services/beauty/BeautyFilter"

interface BeautyPanelProps {
  settings: BeautySettings
  isEnabled: boolean
  onSettingChange: <K extends keyof BeautySettings>(key: K, value: BeautySettings[K]) => void
  onToggle: () => void
  onReset: () => void
}

export function BeautyPanel({
  settings,
  isEnabled,
  onSettingChange,
  onToggle,
  onReset,
}: BeautyPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Beauty Effects</h3>
        <button
          onClick={onToggle}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            isEnabled ? "bg-primary" : "bg-muted"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              isEnabled ? "translate-x-5" : ""
            }`}
          />
        </button>
      </div>

      {isEnabled && (
        <div className="space-y-3">
          <Slider
            label="Smoothing"
            value={settings.smoothing}
            min={0}
            max={100}
            onChange={(v) => onSettingChange("smoothing", v)}
          />
          <Slider
            label="Whitening"
            value={settings.whitening}
            min={0}
            max={100}
            onChange={(v) => onSettingChange("whitening", v)}
          />
          <Slider
            label="Face Slimming"
            value={settings.faceSlimming}
            min={0}
            max={100}
            onChange={(v) => onSettingChange("faceSlimming", v)}
          />
          <Slider
            label="Skin Tone"
            value={settings.skinTone}
            min={0}
            max={100}
            onChange={(v) => onSettingChange("skinTone", v)}
          />

          <button
            onClick={onReset}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Reset to defaults
          </button>
        </div>
      )}
    </div>
  )
}

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}

function Slider({ label, value, min, max, onChange }: SliderProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span>{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
      />
    </div>
  )
}
