/**
 * useRecordingFlow Hook - 单元测试
 *
 * @description
 * 测试 useRecordingFlow hook 的核心功能：
 * - 状态机转换 (idle → previewing → recording ⇄ paused)
 * - startPreview 正确配置录制组件
 * - cancelPreview 正确重置状态
 * - startRecording 开始实际录制
 * - pauseRecording / resumeRecording 暂停恢复
 * - stopRecording 返回 Blob
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"

// Mock canvas recorder - this will be injected into useRecordingFlow
const mockCanvasRecorder: {
  state: "idle" | "recording" | "paused"
  duration: number
  recordedBlob: Blob | null
  previewArea: null
  startRecording: ReturnType<typeof vi.fn>
  stopRecording: ReturnType<typeof vi.fn>
  pauseRecording: ReturnType<typeof vi.fn>
  resumeRecording: ReturnType<typeof vi.fn>
  setPreviewArea: ReturnType<typeof vi.fn>
  setCameraBubbleState: ReturnType<typeof vi.fn>
  setExcalidrawCanvas: ReturnType<typeof vi.fn>
  setCameraVideo: ReturnType<typeof vi.fn>
  setAudioStream: ReturnType<typeof vi.fn>
  setBeautySettings: ReturnType<typeof vi.fn>
} = {
  state: "idle",
  duration: 0,
  recordedBlob: null as Blob | null,
  previewArea: null,
  startRecording: vi.fn().mockResolvedValue(undefined),
  stopRecording: vi.fn().mockResolvedValue(null),
  pauseRecording: vi.fn(),
  resumeRecording: vi.fn(),
  setPreviewArea: vi.fn(),
  setCameraBubbleState: vi.fn(),
  setExcalidrawCanvas: vi.fn(),
  setCameraVideo: vi.fn(),
  setAudioStream: vi.fn(),
  setBeautySettings: vi.fn(),
}

// We need to mock useCanvasRecorder which is imported by useRecordingFlow
vi.mock("@/hooks/useCanvasRecorder", () => ({
  useCanvasRecorder: () => mockCanvasRecorder,
}))

describe("useRecordingFlow", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock state
    mockCanvasRecorder.state = "idle"
    mockCanvasRecorder.duration = 0
    mockCanvasRecorder.recordedBlob = null
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("initialization", () => {
    it("should initialize with idle state", async () => {
      const { useRecordingFlow } = await import("@/hooks")
      const { result } = renderHook(() => useRecordingFlow())

      expect(result.current.state).toBe("idle")
      expect(result.current.isPreviewing).toBe(false)
      expect(result.current.showPreview).toBe(false)
      expect(result.current.duration).toBe(0)
      expect(result.current.recordedBlob).toBeNull()
    })
  })

  describe("startPreview", () => {
    it("should enter previewing state when startPreview is called", async () => {
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
        audioStream: null,
        beautyEnabled: false,
      }

      await act(async () => {
        await result.current.startPreview(config)
      })

      expect(result.current.isPreviewing).toBe(true)
      expect(result.current.showPreview).toBe(true)
    })

    it("should configure preview area via useCanvasRecorder", async () => {
      const { useRecordingFlow } = await import("@/hooks")
      const { result } = renderHook(() => useRecordingFlow())

      const previewArea = { x: 100, y: 100, width: 1920, height: 1080 }
      const config = {
        previewArea,
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
        audioStream: null,
        beautyEnabled: false,
      }

      await act(async () => {
        await result.current.startPreview(config)
      })

      expect(mockCanvasRecorder.setPreviewArea).toHaveBeenCalledWith(previewArea)
    })

    it("should configure camera bubble state", async () => {
      const { useRecordingFlow } = await import("@/hooks")
      const { result } = renderHook(() => useRecordingFlow())

      const cameraBubble = {
        stream: null as MediaStream | null,
        position: { x: 50, y: 50 },
        size: { width: 120, height: 90 },
        shape: "rounded-rect" as const,
        borderRadius: 16,
        borderColor: "#ffffff",
        borderWidth: 3,
      }
      const config = {
        previewArea: { x: 0, y: 0, width: 1920, height: 1080 },
        cameraBubble,
        canvas: null,
        audioStream: null,
        beautyEnabled: false,
      }

      await act(async () => {
        await result.current.startPreview(config)
      })

      expect(mockCanvasRecorder.setCameraBubbleState).toHaveBeenCalledWith(cameraBubble)
    })
  })

  describe("cancelPreview", () => {
    it("should exit previewing state when cancelPreview is called", async () => {
      const { useRecordingFlow } = await import("@/hooks")
      const { result } = renderHook(() => useRecordingFlow())

      // First enter preview state
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
        audioStream: null,
        beautyEnabled: false,
      }

      await act(async () => {
        await result.current.startPreview(config)
      })

      expect(result.current.isPreviewing).toBe(true)
      expect(result.current.showPreview).toBe(true)

      // Then cancel
      act(() => {
        result.current.cancelPreview()
      })

      expect(result.current.isPreviewing).toBe(false)
      expect(result.current.showPreview).toBe(false)
    })
  })

  describe("startRecording", () => {
    it("should call startCanvasRecording", async () => {
      const { useRecordingFlow } = await import("@/hooks")
      const { result } = renderHook(() => useRecordingFlow())

      await act(async () => {
        await result.current.startRecording()
      })

      expect(mockCanvasRecorder.startRecording).toHaveBeenCalled()
    })
  })

  describe("pauseRecording", () => {
    it("should call pauseCanvasRecording", async () => {
      const { useRecordingFlow } = await import("@/hooks")
      const { result } = renderHook(() => useRecordingFlow())

      act(() => {
        result.current.pauseRecording()
      })

      expect(mockCanvasRecorder.pauseRecording).toHaveBeenCalled()
    })
  })

  describe("resumeRecording", () => {
    it("should call resumeCanvasRecording", async () => {
      const { useRecordingFlow } = await import("@/hooks")
      const { result } = renderHook(() => useRecordingFlow())

      act(() => {
        result.current.resumeRecording()
      })

      expect(mockCanvasRecorder.resumeRecording).toHaveBeenCalled()
    })
  })

  describe("stopRecording", () => {
    it("should hide preview after stopping", async () => {
      const mockBlob = new Blob(["test"], { type: "video/webm" })
      mockCanvasRecorder.stopRecording.mockResolvedValue(mockBlob)

      const { useRecordingFlow } = await import("@/hooks")
      const { result } = renderHook(() => useRecordingFlow())

      await act(async () => {
        await result.current.stopRecording()
      })

      expect(result.current.showPreview).toBe(false)
    })

    it("should return the blob from stopCanvasRecording", async () => {
      const mockBlob = new Blob(["test"], { type: "video/webm" })
      mockCanvasRecorder.stopRecording.mockResolvedValue(mockBlob)

      const { useRecordingFlow } = await import("@/hooks")
      const { result } = renderHook(() => useRecordingFlow())

      let returnedBlob: Blob | null = null
      await act(async () => {
        returnedBlob = await result.current.stopRecording()
      })

      expect(returnedBlob).toBe(mockBlob)
      expect(mockCanvasRecorder.stopRecording).toHaveBeenCalled()
    })
  })

  describe("state machine mapping", () => {
    it("should map recorder idle state to app idle state", async () => {
      mockCanvasRecorder.state = "idle"

      const { useRecordingFlow } = await import("@/hooks")
      const { result } = renderHook(() => useRecordingFlow())

      expect(result.current.state).toBe("idle")
    })

    it("should map recorder recording state to app recording state", async () => {
      mockCanvasRecorder.state = "recording"

      const { useRecordingFlow } = await import("@/hooks")
      const { result } = renderHook(() => useRecordingFlow())

      expect(result.current.state).toBe("recording")
    })

    it("should map recorder paused state to app paused state", async () => {
      mockCanvasRecorder.state = "paused"

      const { useRecordingFlow } = await import("@/hooks")
      const { result } = renderHook(() => useRecordingFlow())

      expect(result.current.state).toBe("paused")
    })
  })
})
