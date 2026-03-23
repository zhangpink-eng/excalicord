import { useCallback, useEffect, useRef, useState } from "react"
import { CanvasRecorder, type CameraBubbleState } from "@/services/video/CanvasRecorder"

export type RecorderState = "idle" | "recording" | "paused" | "stopped"

export interface UseCanvasRecorderReturn {
  state: RecorderState
  duration: number
  recordedBlob: Blob | null
  startRecording: () => Promise<void>
  pauseRecording: () => void
  resumeRecording: () => void
  stopRecording: () => Promise<Blob | null>
  setCameraBubbleState: (state: CameraBubbleState) => void
  setExcalidrawCanvas: (canvas: HTMLCanvasElement | null) => void
  setCameraVideo: (video: HTMLVideoElement | null) => void
}

export function useCanvasRecorder(): UseCanvasRecorderReturn {
  const [state, setState] = useState<RecorderState>("idle")
  const [duration, setDuration] = useState(0)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)

  const recorderRef = useRef<CanvasRecorder | null>(null)
  const timerRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const pausedDurationRef = useRef<number>(0)
  const excalidrawCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null)
  const cameraBubbleStateRef = useRef<CameraBubbleState | null>(null)

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

    // Create a hidden canvas for compositing
    const canvas = document.createElement("canvas")
    canvas.width = 1920
    canvas.height = 1080
    recorderRef.current.initialize(canvas)

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

    const blob = await recorderRef.current?.stop() || null
    setRecordedBlob(blob)
    setState("idle")
    return blob
  }, [stopTimer])

  return {
    state,
    duration,
    recordedBlob,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    setCameraBubbleState,
    setExcalidrawCanvas,
    setCameraVideo,
  }
}
