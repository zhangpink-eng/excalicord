/**
 * useRecordingFlow Hook
 *
 * 负责录制流程状态机管理
 *
 * @description
 * - 录制状态机 (idle → previewing → recording ⇄ paused → stopped)
 * - 预览框显示/隐藏
 * - 摄像头/麦克风初始化
 * - 调用 useCanvasRecorder 执行实际录制
 *
 * @see
 * - 技术架构文档: docs/technical-architecture.md
 * - hooks 职责划分: 2.3 逻辑层架构
 */

import { useCallback, useState } from "react"
import type { RecordingState } from "@/types"
import type { CameraBubbleState, PreviewAreaState } from "@/services/video/CanvasRecorder"
import type { BeautySettings } from "@/services/beauty/BeautyFilter"
import { useCanvasRecorder } from "@/hooks"
import { analytics } from "@/services/api/analytics"

// ============================================================================
// Types
// ============================================================================

export interface RecordingFlowConfig {
  previewArea: PreviewAreaState
  cameraBubble: CameraBubbleState
  canvas: HTMLCanvasElement | null
  cameraVideo: HTMLVideoElement | null
  audioStream: MediaStream | null
  beautyEnabled: boolean
  beautySettings?: BeautySettings
  avatarEnabled?: boolean
  avatarStream?: MediaStream | null
  projectId?: string
}

export interface UseRecordingFlowReturn {
  // State
  state: RecordingState
  isPreviewing: boolean
  showPreview: boolean
  duration: number
  recordedBlob: Blob | null

  // Methods
  startPreview: (config: RecordingFlowConfig) => Promise<void>
  cancelPreview: () => void
  startRecording: () => Promise<void>
  pauseRecording: () => void
  resumeRecording: () => void
  stopRecording: () => Promise<Blob | null>

  // Camera bubble management (delegated to useCanvasRecorder)
  setCameraBubbleState: (state: import("@/services/video/CanvasRecorder").CameraBubbleState) => void
}

// ============================================================================
// Hook
// ============================================================================

export function useRecordingFlow(): UseRecordingFlowReturn {
  const {
    state: recorderState,
    duration,
    recordedBlob,
    startRecording: startCanvasRecording,
    stopRecording: stopCanvasRecording,
    pauseRecording: pauseCanvasRecording,
    resumeRecording: resumeCanvasRecording,
    setPreviewArea,
    setCameraBubbleState,
    setExcalidrawCanvas,
    setCameraVideo,
    setAudioStream,
    setBeautySettings,
  } = useCanvasRecorder()

  const [isPreviewing, setIsPreviewing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  /**
   * Enter preview state and set up recording infrastructure
   */
  const startPreview = useCallback(async (config: RecordingFlowConfig): Promise<void> => {
    // Set up preview area
    setPreviewArea(config.previewArea)

    // Set up Excalidraw canvas reference
    if (config.canvas) {
      setExcalidrawCanvas(config.canvas)
    }

    // Set up camera bubble state
    setCameraBubbleState(config.cameraBubble)

    // Set up camera video element for capturing bubble video
    if (config.cameraVideo) {
      setCameraVideo(config.cameraVideo)
    }

    // Set up audio stream
    setAudioStream(config.audioStream)

    // Apply beauty settings
    setBeautySettings(config.beautyEnabled, config.beautySettings)

    // Enter preview state
    setIsPreviewing(true)
    setShowPreview(true)
  }, [setPreviewArea, setExcalidrawCanvas, setCameraBubbleState, setCameraVideo, setAudioStream, setBeautySettings])

  /**
   * Cancel preview and return to idle state
   */
  const cancelPreview = useCallback(() => {
    setIsPreviewing(false)
    setShowPreview(false)
  }, [])

  /**
   * Actually start recording
   */
  const startRecording = useCallback(async (): Promise<void> => {
    setIsPreviewing(false)
    setShowPreview(false)

    try {
      await startCanvasRecording()
    } catch (err) {
      console.error("Failed to start canvas recording:", err)
      throw err
    }

    analytics.trackRecordingStarted("unknown")
  }, [startCanvasRecording])

  /**
   * Pause recording
   */
  const pauseRecording = useCallback((): void => {
    pauseCanvasRecording()
    analytics.trackRecordingPaused("unknown", duration)
  }, [pauseCanvasRecording, duration])

  /**
   * Resume recording
   */
  const resumeRecording = useCallback((): void => {
    resumeCanvasRecording()
    analytics.trackRecordingResumed("unknown")
  }, [resumeCanvasRecording])

  /**
   * Stop recording and return the blob
   */
  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    setShowPreview(false)

    const blob = await stopCanvasRecording()

    if (blob) {
      console.log("[useRecordingFlow] Recording stopped, blob:", blob.size, "bytes, type:", blob.type)

      // Auto-download the recording
      const extension = blob.type === "video/mp4" ? "mp4" : "webm"
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = `recording-${Date.now()}.${extension}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(a.href)
    } else {
      console.warn("[useRecordingFlow] No blob received from recording")
    }

    analytics.trackRecordingStopped("unknown", duration)
    return blob
  }, [stopCanvasRecording, duration])

  // Map recorder state to RecordingState
  const state: RecordingState = recorderState === "idle" || recorderState === "stopped"
    ? "idle"
    : recorderState === "recording"
      ? "recording"
      : recorderState === "paused"
        ? "paused"
        : "idle"

  return {
    state,
    isPreviewing,
    showPreview,
    duration,
    recordedBlob,
    startPreview,
    cancelPreview,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    setCameraBubbleState,
  }
}
