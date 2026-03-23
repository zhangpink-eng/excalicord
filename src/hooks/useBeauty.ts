import { useCallback, useState } from "react"
import { BeautyFilter, defaultBeautySettings, type BeautySettings } from "@/services/beauty/BeautyFilter"

export interface UseBeautyReturn {
  settings: BeautySettings
  isEnabled: boolean
  updateSetting: <K extends keyof BeautySettings>(key: K, value: BeautySettings[K]) => void
  resetSettings: () => void
  toggleBeauty: () => void
  applyBeauty: (imageData: ImageData) => ImageData
}

export function useBeauty(): UseBeautyReturn {
  const [settings, setSettings] = useState<BeautySettings>(defaultBeautySettings)
  const [isEnabled, setIsEnabled] = useState(false)

  const updateSetting = useCallback(<K extends keyof BeautySettings>(
    key: K,
    value: BeautySettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(defaultBeautySettings)
  }, [])

  const toggleBeauty = useCallback(() => {
    setIsEnabled((prev) => !prev)
  }, [])

  const applyBeauty = useCallback(
    (imageData: ImageData): ImageData => {
      if (!isEnabled) return imageData
      const filter = new BeautyFilter(imageData.width, imageData.height)
      return filter.applyBeautyFilter(imageData, settings)
    },
    [isEnabled, settings]
  )

  return {
    settings,
    isEnabled,
    updateSetting,
    resetSettings,
    toggleBeauty,
    applyBeauty,
  }
}
