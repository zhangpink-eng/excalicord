import { useCallback, useEffect, useRef, useState } from "react"
import { avatarService, type AvatarPreset, type AvatarType } from "@/services/ai/AvatarService"

export interface UseAvatarReturn {
  isActive: boolean
  currentAvatar: AvatarPreset | null
  presets: AvatarPreset[]
  outputStream: MediaStream | null
  selectAvatar: (presetId: string) => void
  setPosition: (x: number, y: number) => void
  setScale: (scale: number) => void
  start: (sourceStream: MediaStream) => void
  stop: () => void
  generateAvatar: (imageUrl: string, type: AvatarType) => Promise<MediaStream | null>
}

export function useAvatar(): UseAvatarReturn {
  const [isActive, setIsActive] = useState(false)
  const [currentAvatar, setCurrentAvatar] = useState<AvatarPreset | null>(null)
  const [outputStream, setOutputStream] = useState<MediaStream | null>(null)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const presets = avatarService.listPresets()

  // Initialize avatar canvas on mount
  useEffect(() => {
    // Create a hidden canvas for avatar rendering
    const canvas = document.createElement("canvas")
    canvas.width = 1280
    canvas.height = 720
    canvas.style.display = "none"
    canvas.id = "avatar-canvas"
    document.body.appendChild(canvas)
    canvasRef.current = canvas

    avatarService.initialize(canvas)

    return () => {
      avatarService.destroy()
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas)
      }
    }
  }, [])

  const selectAvatar = useCallback((presetId: string) => {
    avatarService.selectAvatar(presetId)
    setCurrentAvatar(avatarService.getCurrentAvatar())
  }, [])

  const setPosition = useCallback((x: number, y: number) => {
    avatarService.setPosition(x, y)
  }, [])

  const setScale = useCallback((scale: number) => {
    avatarService.setScale(scale)
  }, [])

  const start = useCallback((sourceStream: MediaStream) => {
    const stream = avatarService.start(sourceStream)
    setOutputStream(stream)
    setIsActive(true)
  }, [])

  const stop = useCallback(() => {
    avatarService.stop()
    setOutputStream(null)
    setIsActive(false)
  }, [])

  const generateAvatar = useCallback(async (imageUrl: string, type: AvatarType): Promise<MediaStream | null> => {
    return avatarService.generateAvatar(imageUrl, type)
  }, [])

  return {
    isActive,
    currentAvatar,
    presets,
    outputStream,
    selectAvatar,
    setPosition,
    setScale,
    start,
    stop,
    generateAvatar,
  }
}
