import { useCallback, useEffect, useRef, useState } from "react"
import { avatarService, type AvatarPreset, type AvatarType } from "@/services/ai/AvatarService"

export interface UseAvatarReturn {
  isActive: boolean
  isLoading: boolean
  isReady: boolean
  error: string | null
  currentAvatar: AvatarPreset | null
  presets: AvatarPreset[]
  outputStream: MediaStream | null
  selectAvatar: (presetId: string) => void
  setPosition: (x: number, y: number) => void
  setScale: (scale: number) => void
  setExpression: (expression: "neutral" | "happy" | "serious") => void
  start: (sourceStream: MediaStream) => void
  stop: () => void
  generateAvatar: (imageUrl: string, type: AvatarType) => Promise<MediaStream | null>

  // Agent能力：Avatar开关状态机
  isEnabled: boolean
  toggle: (cameraStream?: MediaStream | null) => void
  selectAndStart: (presetId: string, cameraStream: MediaStream) => void
}

export function useAvatar(): UseAvatarReturn {
  const [isActive, setIsActive] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentAvatar, setCurrentAvatar] = useState<AvatarPreset | null>(null)
  const [outputStream, setOutputStream] = useState<MediaStream | null>(null)

  // Agent能力：Avatar开关状态
  const [isEnabled, setIsEnabled] = useState(false)

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

    // Initialize asynchronously (loads face-api models)
    avatarService.initialize(canvas).then(() => {
      setIsReady(true)
      setIsLoading(false)
      setError(null)
      console.log("[useAvatar] Avatar service ready")
    }).catch((err) => {
      console.error("[useAvatar] Failed to initialize avatar service:", err)
      setError("Failed to load AI Avatar models. Please refresh the page.")
      setIsLoading(false)
    })

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

  const setExpression = useCallback((expression: "neutral" | "happy" | "serious") => {
    avatarService.setExpression(expression)
  }, [])

  const start = useCallback((sourceStream: MediaStream) => {
    if (!isReady) {
      console.warn("[useAvatar] Avatar service not ready yet")
      return
    }
    const stream = avatarService.start(sourceStream)
    setOutputStream(stream)
    setIsActive(true)
  }, [isReady])

  const stop = useCallback(() => {
    avatarService.stop()
    setOutputStream(null)
    setIsActive(false)
  }, [])

  const generateAvatar = useCallback(async (imageUrl: string, type: AvatarType): Promise<MediaStream | null> => {
    return avatarService.generateAvatar(imageUrl, type)
  }, [])

  // Agent能力：toggle - Avatar开关状态机
  const toggle = useCallback((cameraStream?: MediaStream | null) => {
    if (isEnabled) {
      stop()
      setIsEnabled(false)
    } else {
      // If no avatar selected, select the first one
      if (!currentAvatar && presets.length > 0) {
        selectAvatar(presets[0].id)
      }
      // Start avatar with camera stream if provided
      if (cameraStream) {
        start(cameraStream)
      }
      setIsEnabled(true)
    }
  }, [isEnabled, currentAvatar, presets, stop, start, selectAvatar])

  // Agent能力：selectAndStart - 选择并启动
  const selectAndStart = useCallback((presetId: string, cameraStream: MediaStream) => {
    selectAvatar(presetId)
    start(cameraStream)
    setIsEnabled(true)
  }, [selectAvatar, start])

  return {
    isActive,
    isLoading,
    isReady,
    error,
    currentAvatar,
    presets,
    outputStream,
    selectAvatar,
    setPosition,
    setScale,
    setExpression,
    start,
    stop,
    generateAvatar,

    // Agent能力
    isEnabled,
    toggle,
    selectAndStart,
  }
}
