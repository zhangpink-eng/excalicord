/**
 * Recording Flow Integration Tests
 *
 * @description
 * 测试录制流程的完整数据流：
 * 1. handleRecord → startPreview 配置
 * 2. handleStartRecording → 实际录制
 * 3. CanvasRecorder.compositeFrame 合成
 *
 * @issues identified
 * - setCameraVideo 从未被调用 (已修复)
 * - previewArea 尺寸不一致 (已修复)
 */

import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"

// Mock useCanvasRecorder
const mockSetCameraVideo = vi.fn()
const mockSetPreviewArea = vi.fn()
const mockSetCameraBubbleState = vi.fn()
const mockSetExcalidrawCanvas = vi.fn()
const mockSetAudioStream = vi.fn()
const mockSetBeautySettings = vi.fn()
const mockStartRecording = vi.fn().mockResolvedValue(undefined)
const mockStopRecording = vi.fn().mockResolvedValue(null)

vi.mock("@/hooks/useCanvasRecorder", () => ({
  useCanvasRecorder: () => ({
    state: "idle",
    duration: 0,
    recordedBlob: null,
    previewArea: { x: 0, y: 0, width: 1920, height: 1080 },
    startRecording: mockStartRecording,
    stopRecording: mockStopRecording,
    pauseRecording: vi.fn(),
    resumeRecording: vi.fn(),
    setPreviewArea: mockSetPreviewArea,
    setCameraBubbleState: mockSetCameraBubbleState,
    setExcalidrawCanvas: mockSetExcalidrawCanvas,
    setCameraVideo: mockSetCameraVideo,
    setAudioStream: mockSetAudioStream,
    setBeautySettings: mockSetBeautySettings,
  }),
}))

describe("Recording Flow Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Issue 1: setCameraVideo should be called", () => {
    it("should call setCameraVideo when starting preview with cameraVideo element", async () => {
      const { useRecordingFlow } = await import("@/hooks")
      const { result } = renderHook(() => useRecordingFlow())

      // Create a mock video element
      const mockVideo = document.createElement("video")

      const config = {
        previewArea: { x: 0, y: 0, width: 1920, height: 1080 },
        cameraBubble: {
          stream: null,
          position: { x: 50, y: 50 },
          size: { width: 120, height: 90 },
          shape: "rounded-rect" as const,
          borderRadius: 16,
          borderColor: "#ffffff",
          borderWidth: 3,
        },
        canvas: null,
        cameraVideo: mockVideo,
        audioStream: null,
        beautyEnabled: false,
      }

      await act(async () => {
        await result.current.startPreview(config)
      })

      expect(mockSetCameraVideo).toHaveBeenCalledWith(mockVideo)
    })

    it("should not call setCameraVideo when cameraVideo is null", async () => {
      const { useRecordingFlow } = await import("@/hooks")
      const { result } = renderHook(() => useRecordingFlow())

      const config = {
        previewArea: { x: 0, y: 0, width: 1920, height: 1080 },
        cameraBubble: {
          stream: null,
          position: { x: 50, y: 50 },
          size: { width: 120, height: 90 },
          shape: "rounded-rect" as const,
          borderRadius: 16,
          borderColor: "#ffffff",
          borderWidth: 3,
        },
        canvas: null,
        cameraVideo: null,
        audioStream: null,
        beautyEnabled: false,
      }

      await act(async () => {
        await result.current.startPreview(config)
      })

      expect(mockSetCameraVideo).not.toHaveBeenCalled()
    })
  })

  describe("Issue 2: previewArea dimensions should be 1.1x", () => {
    it("should use 1.1x dimensions for preview area when frame is 1920x1080", async () => {
      const { useRecordingFlow } = await import("@/hooks")
      const { result } = renderHook(() => useRecordingFlow())

      const frameWidth = 1920
      const frameHeight = 1080
      const expectedWidth = Math.round(frameWidth * 1.1) // 2112
      const expectedHeight = Math.round(frameHeight * 1.1) // 1188

      const mockVideo = document.createElement("video")

      const config = {
        previewArea: {
          x: 0,
          y: 0,
          width: expectedWidth,
          height: expectedHeight,
        },
        cameraBubble: {
          stream: null,
          position: { x: 50, y: 50 },
          size: { width: 120, height: 90 },
          shape: "rounded-rect" as const,
          borderRadius: 16,
          borderColor: "#ffffff",
          borderWidth: 3,
        },
        canvas: null,
        cameraVideo: mockVideo,
        audioStream: null,
        beautyEnabled: false,
      }

      await act(async () => {
        await result.current.startPreview(config)
      })

      expect(mockSetPreviewArea).toHaveBeenCalledWith(
        expect.objectContaining({
          width: 2112,
          height: 1188,
        })
      )
    })
  })

  describe("State machine transitions", () => {
    it("should transition from idle to previewing and back to idle", async () => {
      const { useRecordingFlow } = await import("@/hooks")
      const { result } = renderHook(() => useRecordingFlow())

      // Initial state
      expect(result.current.state).toBe("idle")
      expect(result.current.isPreviewing).toBe(false)
      expect(result.current.showPreview).toBe(false)

      const mockVideo = document.createElement("video")
      const config = {
        previewArea: { x: 0, y: 0, width: 1920, height: 1080 },
        cameraBubble: {
          stream: null,
          position: { x: 50, y: 50 },
          size: { width: 120, height: 90 },
          shape: "rounded-rect" as const,
          borderRadius: 16,
          borderColor: "#ffffff",
          borderWidth: 3,
        },
        canvas: null,
        cameraVideo: mockVideo,
        audioStream: null,
        beautyEnabled: false,
      }

      // Start preview
      await act(async () => {
        await result.current.startPreview(config)
      })

      expect(result.current.isPreviewing).toBe(true)
      expect(result.current.showPreview).toBe(true)

      // Cancel
      act(() => {
        result.current.cancelPreview()
      })

      expect(result.current.isPreviewing).toBe(false)
      expect(result.current.showPreview).toBe(false)
    })
  })
})
