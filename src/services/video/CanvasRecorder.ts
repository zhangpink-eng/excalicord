/**
 * CanvasRecorder - Captures Excalidraw canvas and CameraBubble as a video
 *
 * This service handles compositing the Excalidraw canvas with the camera bubble
 * overlay and encoding it as a video using MediaRecorder API.
 */

import { BeautyFilter, type BeautySettings } from "@/services/beauty/BeautyFilter"

export interface CameraBubbleState {
  stream: MediaStream | null
  position: { x: number; y: number }
  size: { width: number; height: number }
  shape: "rounded-rect" | "circle" | "pill"
  borderRadius: number
  borderColor: string
  borderWidth: number
}

export interface CanvasRecorderOptions {
  fps?: number
  mimeType?: string
}

export class CanvasRecorder {
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private mediaRecorder: MediaRecorder | null = null
  private stream: MediaStream | null = null
  private chunks: Blob[] = []
  private animationId: number | null = null
  private isRecording = false
  private fps: number
  private mimeType: string

  // Canvas elements to composite
  private excalidrawCanvas: HTMLCanvasElement | null = null
  private cameraBubble: CameraBubbleState | null = null
  private cameraVideo: HTMLVideoElement | null = null

  // Beauty filter
  private beautyFilter: BeautyFilter | null = null
  private beautyEnabled = false
  private beautySettings: BeautySettings = {
    smoothing: 30,
    whitening: 20,
    faceSlimming: 0,
    skinTone: 50,
  }
  private beautyCanvas: OffscreenCanvas | null = null

  // Dimensions
  private width = 1920
  private height = 1080

  constructor(options: CanvasRecorderOptions = {}) {
    this.fps = options.fps || 30
    this.mimeType = options.mimeType || "video/webm;codecs=vp9"
  }

  /**
   * Initialize the recorder with a target canvas element
   */
  initialize(canvas: HTMLCanvasElement): void {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")
    this.width = canvas.width || 1920
    this.height = canvas.height || 1080
  }

  /**
   * Set the Excalidraw canvas element to capture
   */
  setExcalidrawCanvas(canvas: HTMLCanvasElement | null): void {
    this.excalidrawCanvas = canvas
  }

  /**
   * Set the camera bubble state for compositing
   */
  setCameraBubble(state: CameraBubbleState | null): void {
    this.cameraBubble = state
  }

  /**
   * Set the camera video element for capturing the bubble
   */
  setCameraVideo(video: HTMLVideoElement | null): void {
    this.cameraVideo = video
  }

  /**
   * Set beauty filter settings
   */
  setBeautySettings(enabled: boolean, settings?: BeautySettings): void {
    this.beautyEnabled = enabled
    if (settings) {
      this.beautySettings = settings
    }
    if (enabled && !this.beautyFilter) {
      this.beautyFilter = new BeautyFilter(this.width, this.height)
      this.beautyCanvas = new OffscreenCanvas(this.width, this.height)
    }
  }

  /**
   * Start recording
   */
  async start(): Promise<void> {
    if (this.isRecording) {
      console.warn("CanvasRecorder: Already recording")
      return
    }

    if (!this.canvas) {
      throw new Error("CanvasRecorder: Canvas not initialized")
    }

    this.chunks = []

    // Create a stream from the canvas
    const canvasStream = this.canvas.captureStream(this.fps)

    // Try to add audio track from camera
    if (this.cameraBubble?.stream) {
      const audioTracks = this.cameraBubble.stream.getAudioTracks()
      audioTracks.forEach((track) => {
        canvasStream.addTrack(track)
      })
    }

    // Determine supported MIME type
    let mimeType = this.mimeType
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = "video/webm"
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = ""
      }
    }

    const options: MediaRecorderOptions = mimeType ? { mimeType } : {}

    this.mediaRecorder = new MediaRecorder(canvasStream, options)

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.chunks.push(e.data)
      }
    }

    this.mediaRecorder.start(100) // Collect data every 100ms
    this.isRecording = true

    // Start the composite render loop
    this.startRenderLoop()
  }

  /**
   * Stop recording and return the recorded blob
   */
  async stop(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecording) {
        resolve(null)
        return
      }

      this.stopRenderLoop()

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: this.mimeType || "video/webm" })
        this.isRecording = false
        resolve(blob)
      }

      this.mediaRecorder.stop()
    })
  }

  /**
   * Pause recording
   */
  pause(): void {
    if (this.mediaRecorder?.state === "recording") {
      this.mediaRecorder.pause()
      this.stopRenderLoop()
    }
  }

  /**
   * Resume recording
   */
  resume(): void {
    if (this.mediaRecorder?.state === "paused") {
      this.mediaRecorder.resume()
      if (this.cameraBubble) {
        this.startRenderLoop()
      }
    }
  }

  /**
   * Get current recording state
   */
  getState(): "inactive" | "recording" | "paused" | "stopped" {
    return this.mediaRecorder?.state || "inactive"
  }

  /**
   * Start the render loop to composite canvas + camera bubble
   */
  private startRenderLoop(): void {
    // Use setInterval for consistent FPS
    const intervalMs = 1000 / this.fps

    const intervalId = setInterval(() => {
      if (this.isRecording) {
        this.compositeFrame()
      }
    }, intervalMs)

    // Store cleanup function
    this.animationId = intervalId as unknown as number
  }

  /**
   * Stop the render loop
   */
  private stopRenderLoop(): void {
    if (this.animationId !== null) {
      clearInterval(this.animationId as unknown as ReturnType<typeof setInterval>)
      this.animationId = null
    }
  }

  /**
   * Composite the Excalidraw canvas and camera bubble onto our recording canvas
   */
  private compositeFrame(): void {
    if (!this.ctx || !this.canvas) return

    // Clear the canvas
    this.ctx.fillStyle = "#fafafa"
    this.ctx.fillRect(0, 0, this.width, this.height)

    // Draw Excalidraw canvas if available
    if (this.excalidrawCanvas) {
      try {
        this.ctx.drawImage(this.excalidrawCanvas, 0, 0, this.width, this.height)
      } catch (e) {
        console.warn("CanvasRecorder: Failed to draw Excalidraw canvas", e)
      }
    }

    // Draw camera bubble if available and has video
    if (this.cameraBubble && this.cameraVideo && this.cameraVideo.readyState >= 2) {
      const { position, size, shape, borderRadius, borderColor, borderWidth } = this.cameraBubble
      const { x, y } = position
      const { width, height } = size

      this.ctx.save()

      // Apply border and shadow
      this.ctx.shadowColor = "rgba(0, 0, 0, 0.15)"
      this.ctx.shadowBlur = 12
      this.ctx.shadowOffsetX = 0
      this.ctx.shadowOffsetY = 4

      // Draw border
      this.ctx.strokeStyle = borderColor
      this.ctx.lineWidth = borderWidth

      // Clip based on shape
      this.ctx.beginPath()
      switch (shape) {
        case "circle":
          this.ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2)
          break
        case "pill":
          this.ctx.roundRect(x, y, width, height, height / 2)
          break
        default:
          this.ctx.roundRect(x, y, width, height, borderRadius)
      }
      this.ctx.stroke()

      // Reset shadow for video
      this.ctx.shadowColor = "transparent"

      // Clip and draw video
      this.ctx.beginPath()
      switch (shape) {
        case "circle":
          this.ctx.ellipse(x + width / 2, y + height / 2, (width - borderWidth * 2) / 2, (height - borderWidth * 2) / 2, 0, 0, Math.PI * 2)
          break
        case "pill":
          this.ctx.roundRect(x + borderWidth, y + borderWidth, width - borderWidth * 2, height - borderWidth * 2, (height - borderWidth * 2) / 2)
          break
        default:
          this.ctx.roundRect(x + borderWidth, y + borderWidth, width - borderWidth * 2, height - borderWidth * 2, borderRadius)
      }
      this.ctx.clip()

      // Draw video (flip horizontally for mirror effect)
      this.ctx.scale(-1, 1)

      // Apply beauty filter if enabled
      if (this.beautyEnabled && this.beautyFilter && this.beautyCanvas) {
        const tempCtx = this.beautyCanvas.getContext("2d")
        if (tempCtx) {
          // Draw video to temp canvas (mirrored)
          tempCtx.save()
          tempCtx.scale(-1, 1)
          tempCtx.drawImage(this.cameraVideo, -width, 0, width, height)
          tempCtx.restore()

          // Get image data and apply beauty filter
          const imageData = tempCtx.getImageData(0, 0, width, height)
          const processedData = this.beautyFilter.applyBeautyFilter(imageData, this.beautySettings)

          // Put processed data back
          tempCtx.putImageData(processedData, 0, 0)

          // Draw the processed canvas (note: mirror is already applied in tempCtx)
          this.ctx.save()
          this.ctx.scale(-1, 1)
          this.ctx.drawImage(this.beautyCanvas, -x - width, y, width, height)
          this.ctx.restore()
          this.ctx.setTransform(1, 0, 0, 1, 0, 0)
        } else {
          this.ctx.drawImage(this.cameraVideo, -x - width, y, width, height)
          this.ctx.setTransform(1, 0, 0, 1, 0, 0)
        }
      } else {
        this.ctx.drawImage(this.cameraVideo, -x - width, y, width, height)
        this.ctx.setTransform(1, 0, 0, 1, 0, 0)
      }

      this.ctx.restore()
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stopRenderLoop()
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop()
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
    }
    this.mediaRecorder = null
    this.stream = null
    this.canvas = null
    this.ctx = null
    this.excalidrawCanvas = null
    this.cameraBubble = null
    this.cameraVideo = null
  }
}

export const canvasRecorder = new CanvasRecorder()
