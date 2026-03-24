import { useCallback, useEffect, useRef, useState } from "react"
import { CanvasRecorder, type CameraBubbleState, type PreviewAreaState } from "@/services/video/CanvasRecorder"
import type { BeautySettings } from "@/services/beauty/BeautyFilter"

export type RecorderState = "idle" | "recording" | "paused" | "stopped"

export interface UseCanvasRecorderReturn {
  state: RecorderState
  duration: number
  recordedBlob: Blob | null
  previewArea: PreviewAreaState
  startRecording: () => Promise<void>
  pauseRecording: () => void
  resumeRecording: () => void
  stopRecording: () => Promise<Blob | null>
  setCameraBubbleState: (state: CameraBubbleState) => void
  setExcalidrawCanvas: (canvas: HTMLCanvasElement | null) => void
  setCameraVideo: (video: HTMLVideoElement | null) => void
  setBeautySettings: (enabled: boolean, settings?: BeautySettings) => void
  setPreviewArea: (area: PreviewAreaState) => void
}

export function useCanvasRecorder(): UseCanvasRecorderReturn {
  const [state, setState] = useState<RecorderState>("idle")
  const [duration, setDuration] = useState(0)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [previewArea, setPreviewAreaState] = useState<PreviewAreaState>({ x: 0, y: 0, width: 1280, height: 720 })

  const recorderRef = useRef<CanvasRecorder | null>(null)
  const timerRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const pausedDurationRef = useRef<number>(0)
  const excalidrawCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null)
  const cameraBubbleStateRef = useRef<CameraBubbleState | null>(null)
  const previewAreaRef = useRef<PreviewAreaState>(previewArea)

  // Sync preview area ref
  useEffect(() => {
    previewAreaRef.current = previewArea
  }, [previewArea])

  // Initialize recorder
  useEffect(() => {
    recorderRef.current = new CanvasRecorder({ fps: 30 })

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      recorderRef.current?.destroy()
    }
  }, [])

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now() - pausedDurationRef.current * 1000
    timerRef.current = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      setDuration(elapsed)
    }, 1000)
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
    pausedDurationRef.current = elapsed
  }, [])

  const setPreviewArea = useCallback((area: PreviewAreaState) => {
    setPreviewAreaState(area)
    previewAreaRef.current = area
    recorderRef.current?.setPreviewArea(area)
  }, [])

  const setCameraBubbleState = useCallback((state: CameraBubbleState) => {
    cameraBubbleStateRef.current = state
    recorderRef.current?.setCameraBubble(state)
  }, [])

  const setExcalidrawCanvas = useCallback((canvas: HTMLCanvasElement | null) => {
    excalidrawCanvasRef.current = canvas
    recorderRef.current?.setExcalidrawCanvas(canvas)
  }, [])

  const setCameraVideo = useCallback((video: HTMLVideoElement | null) => {
    cameraVideoRef.current = video
    recorderRef.current?.setCameraVideo(video)
  }, [])

  const setBeautySettings = useCallback((enabled: boolean, settings?: BeautySettings) => {
    recorderRef.current?.setBeautySettings(enabled, settings)
  }, [])

  const startRecording = useCallback(async () => {
    if (!recorderRef.current || state === "recording") return

    // Find the Excalidraw canvas
    const excalidrawContainer = document.querySelector(".excalidraw-canvas") as HTMLElement
    if (excalidrawContainer) {
      const excalidrawCanvas = excalidrawContainer.querySelector("canvas")
      if (excalidrawCanvas) {
        excalidrawCanvasRef.current = excalidrawCanvas
        recorderRef.current.setExcalidrawCanvas(excalidrawCanvas)
      }
    }

    // Create a canvas sized for the preview area
    const { width, height } = previewAreaRef.current
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    recorderRef.current.initialize(canvas)

    // Set preview area on recorder
    recorderRef.current.setPreviewArea(previewAreaRef.current)

    // Apply camera bubble state if available
    if (cameraBubbleStateRef.current) {
      recorderRef.current.setCameraBubble(cameraBubbleStateRef.current)
    }

    try {
      await recorderRef.current.start()
      setState("recording")
      pausedDurationRef.current = 0
      startTimer()
    } catch (err) {
      console.error("Failed to start recording:", err)
      setState("idle")
    }
  }, [state, startTimer])

  const pauseRecording = useCallback(() => {
    recorderRef.current?.pause()
    stopTimer()
    setState("paused")
  }, [stopTimer])

  const resumeRecording = useCallback(() => {
    recorderRef.current?.resume()
    startTimer()
    setState("recording")
  }, [startTimer])

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    stopTimer()
    setState("stopped")

    // Reset duration
    pausedDurationRef.current = 0
    setDuration(0)

    const blob = await recorderRef.current?.stop() || null
    setRecordedBlob(blob)
    setState("idle")
    return blob
  }, [stopTimer])

  return {
    state,
    duration,
    recordedBlob,
    previewArea,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    setCameraBubbleState,
    setExcalidrawCanvas,
    setCameraVideo,
    setBeautySettings,
    setPreviewArea,
  }
}
