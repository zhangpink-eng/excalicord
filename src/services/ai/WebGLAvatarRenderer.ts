/**
 * WebGL Avatar Renderer with Face-api.js
 *
 * Real-time face detection and avatar rendering using face-api.js
 */

import * as faceapi from "face-api.js"

export interface AvatarStyle {
  type: "illustrated" | "anime" | "realistic"
  color: string
  outlineColor: string
  expression: "neutral" | "happy" | "serious"
}

export const AVATAR_STYLES: Record<string, AvatarStyle> = {
  illustrated: {
    type: "illustrated",
    color: "#4A90D9",
    outlineColor: "#2D5A87",
    expression: "neutral",
  },
  anime: {
    type: "anime",
    color: "#FF6B9D",
    outlineColor: "#CC4D73",
    expression: "happy",
  },
  realistic: {
    type: "realistic",
    color: "#8B6914",
    outlineColor: "#5C4A0F",
    expression: "neutral",
  },
}

// Model loading state
let modelsLoaded = false
let modelsLoading = false
const modelLoadCallbacks: Array<() => void> = []

async function loadModels(): Promise<void> {
  if (modelsLoaded) return

  if (modelsLoading) {
    return new Promise((resolve) => {
      modelLoadCallbacks.push(resolve)
    })
  }

  modelsLoading = true
  console.log("[AvatarRenderer] Loading face-api.js models...")

  try {
    // Load models from CDN
    const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model"

    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    ])

    modelsLoaded = true
    console.log("[AvatarRenderer] Face-api.js models loaded successfully")

    // Resolve all waiting callbacks
    modelLoadCallbacks.forEach((cb) => cb())
    modelLoadCallbacks.length = 0
  } catch (error) {
    console.error("[AvatarRenderer] Failed to load face-api.js models:", error)
    throw error
  } finally {
    modelsLoading = false
  }
}

export class WebGLAvatarRenderer {
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private videoElement: HTMLVideoElement | null = null
  private isRendering = false
  private animationFrameId: number | null = null
  private faceDetectionInterval: NodeJS.Timeout | null = null

  // Avatar state
  private avatarStyle: AvatarStyle = AVATAR_STYLES.illustrated
  private avatarPosition = { x: 0.7, y: 0.75 } // Default position (bottom-right)
  private avatarScale = 1.0
  private avatarRotation = 0

  // Face detection state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private lastFaceDetection: any = null
  private faceDetectionRunning = false

  async initialize(canvas: HTMLCanvasElement): Promise<void> {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")

    // Load face-api models
    await loadModels()
  }

  setVideoElement(video: HTMLVideoElement | null): void {
    this.videoElement = video
  }

  setAvatarStyle(style: AvatarStyle): void {
    this.avatarStyle = style
  }

  setExpression(expression: "neutral" | "happy" | "serious"): void {
    this.avatarStyle = {
      ...this.avatarStyle,
      expression,
    }
  }

  setAvatarPosition(x: number, y: number): void {
    this.avatarPosition = { x, y }
  }

  setAvatarScale(scale: number): void {
    this.avatarScale = Math.max(0.5, Math.min(2.0, scale))
  }

  /**
   * Start the avatar render loop
   */
  start(): void {
    if (this.isRendering) return
    this.isRendering = true
    this.startFaceDetection()
    this.renderLoop()
  }

  /**
   * Stop the avatar render loop
   */
  stop(): void {
    this.isRendering = false
    this.stopFaceDetection()
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  private startFaceDetection(): void {
    if (this.faceDetectionRunning || !this.videoElement) return
    this.faceDetectionRunning = true

    // Detect face every 100ms to balance performance and responsiveness
    this.faceDetectionInterval = setInterval(async () => {
      await this.detectFace()
    }, 100)
  }

  private stopFaceDetection(): void {
    this.faceDetectionRunning = false
    if (this.faceDetectionInterval) {
      clearInterval(this.faceDetectionInterval)
      this.faceDetectionInterval = null
    }
    this.lastFaceDetection = null
  }

  private async detectFace(): Promise<void> {
    if (!this.videoElement || !this.canvas || this.videoElement.readyState < 2) return

    try {
      const options = new faceapi.TinyFaceDetectorOptions({
        inputSize: 320,
        scoreThreshold: 0.5,
      })

      const detection = await faceapi
        .detectSingleFace(this.videoElement, options)
        .withFaceLandmarks(true)

      this.lastFaceDetection = detection || null
    } catch (error) {
      // Silently ignore detection errors to avoid console spam
    }
  }

  /**
   * Render loop
   */
  private renderLoop(): void {
    if (!this.isRendering) return

    this.renderFrame()

    this.animationFrameId = requestAnimationFrame(() => this.renderLoop())
  }

  private renderFrame(): void {
    if (!this.ctx || !this.canvas) return

    const { width, height } = this.canvas

    // Clear canvas
    this.ctx.clearRect(0, 0, width, height)

    // Draw video frame (mirrored) in background
    if (this.videoElement && this.videoElement.readyState >= 2) {
      this.drawVideoFrame()
    }

    // Draw avatar with face swap
    this.drawAvatar()
  }

  private drawVideoFrame(): void {
    if (!this.ctx || !this.canvas || !this.videoElement) return

    const { width, height } = this.canvas
    const video = this.videoElement

    // Calculate video dimensions to cover canvas (cover fit)
    const videoAspect = video.videoWidth / video.videoHeight
    const canvasAspect = width / height

    let drawWidth: number
    let drawHeight: number
    let offsetX: number
    let offsetY: number

    if (videoAspect > canvasAspect) {
      drawHeight = height
      drawWidth = height * videoAspect
      offsetX = (width - drawWidth) / 2
      offsetY = 0
    } else {
      drawWidth = width
      drawHeight = width / videoAspect
      offsetX = 0
      offsetY = (height - drawHeight) / 2
    }

    // Draw mirrored video
    this.ctx.save()
    this.ctx.translate(width, 0)
    this.ctx.scale(-1, 1)
    this.ctx.drawImage(video, width - offsetX - drawWidth, offsetY, drawWidth, drawHeight)
    this.ctx.restore()
  }

  private drawAvatar(): void {
    if (!this.ctx || !this.canvas) return

    const { width, height } = this.canvas

    // Calculate avatar size and position
    const baseSize = Math.min(width, height) * 0.3
    const avatarSize = baseSize * this.avatarScale
    const centerX = this.avatarPosition.x * width
    const centerY = this.avatarPosition.y * height

    this.ctx.save()
    this.ctx.translate(centerX, centerY)
    this.ctx.rotate(this.avatarRotation)

    // Draw avatar background circle
    this.drawAvatarBackground(avatarSize)

    // If we have face detection, overlay the user's face
    if (this.lastFaceDetection) {
      this.overlayFace(avatarSize)
    }

    // Draw avatar features (eyes, mouth based on expression)
    this.drawAvatarFeatures(avatarSize)

    this.ctx.restore()
  }

  private drawAvatarBackground(size: number): void {
    if (!this.ctx) return

    const { color, outlineColor, type } = this.avatarStyle

    // Outer glow
    const gradient = this.ctx.createRadialGradient(0, 0, size * 0.8, 0, 0, size * 1.2)
    gradient.addColorStop(0, "rgba(255, 255, 255, 0)")
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)")

    // Face circle
    this.ctx.beginPath()

    if (type === "realistic") {
      // More natural shape for realistic
      this.ctx.ellipse(0, 0, size, size * 1.1, 0, 0, Math.PI * 2)
    } else {
      this.ctx.arc(0, 0, size, 0, Math.PI * 2)
    }

    // Fill with gradient or solid color
    const faceGradient = this.ctx.createRadialGradient(
      -size * 0.3,
      -size * 0.3,
      0,
      0,
      0,
      size
    )
    faceGradient.addColorStop(0, this.lightenColor(color, 30))
    faceGradient.addColorStop(0.7, color)
    faceGradient.addColorStop(1, this.darkenColor(color, 20))

    this.ctx.fillStyle = faceGradient
    this.ctx.fill()

    this.ctx.strokeStyle = outlineColor
    this.ctx.lineWidth = size * 0.03
    this.ctx.stroke()
  }

  private overlayFace(avatarSize: number): void {
    if (!this.ctx || !this.lastFaceDetection || !this.videoElement) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const detection = this.lastFaceDetection as any
    const landmarks = detection.landmarks
    const box = detection.detection?.box || detection.box

    if (!box) return

    // Get face region from video
    const faceRegion = this.extractFaceRegion(box, landmarks)

    if (faceRegion) {
      // Calculate position for face overlay
      const faceSize = avatarSize * 0.6
      const faceX = -avatarSize * 0.1
      const faceY = -avatarSize * 0.15
      const radiusX = faceSize * 0.45
      const radiusY = faceSize * 0.55

      // Draw face with feathered edge effect (3 layers)
      for (let layer = 3; layer >= 1; layer--) {
        this.ctx.save()

        // Create ellipse for this layer with slight expansion for feather effect
        const expansion = (4 - layer) * 2
        this.ctx.beginPath()
        this.ctx.ellipse(faceX, faceY, radiusX + expansion, radiusY + expansion, 0, 0, Math.PI * 2)

        if (layer === 1) {
          // Bottom layer - clip to face shape
          this.ctx.clip()
        }

        // Draw scaled face region
        const scaleX = (radiusX * 2 + expansion * 2) / faceRegion.width
        const scaleY = (radiusY * 2 + expansion * 2) / faceRegion.height
        this.ctx.drawImage(
          faceRegion,
          faceX - (radiusX + expansion) * (faceRegion.width / (radiusX * 2)),
          faceY - (radiusY + expansion) * (faceRegion.height / (radiusY * 2)),
          faceRegion.width * scaleX,
          faceRegion.height * scaleY
        )

        // Apply cartoon color tint (stronger on outer layers for edge blending)
        this.ctx.fillStyle = layer === 1 ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0)"
        this.ctx.fill()

        this.ctx.restore()
      }

      // Draw face outline/shadow for definition
      this.ctx.save()
      this.ctx.beginPath()
      this.ctx.ellipse(faceX, faceY, radiusX, radiusY, 0, 0, Math.PI * 2)
      this.ctx.strokeStyle = "rgba(0, 0, 0, 0.1)"
      this.ctx.lineWidth = 2
      this.ctx.stroke()
      this.ctx.restore()
    }
  }

  private extractFaceRegion(
    box: { x: number; y: number; width: number; height: number },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _landmarks: any
  ): HTMLCanvasElement | null {
    if (!this.videoElement || !this.canvas) return null

    const video = this.videoElement
    if (video.readyState < 2) return null

    // Create a canvas to extract face region
    const faceCanvas = document.createElement("canvas")
    const padding = box.width * 0.3

    const extractX = Math.max(0, box.x - padding)
    const extractY = Math.max(0, box.y - padding)
    const extractWidth = Math.min(video.videoWidth - extractX, box.width + padding * 2)
    const extractHeight = Math.min(video.videoHeight - extractY, box.height + padding * 2)

    faceCanvas.width = extractWidth
    faceCanvas.height = extractHeight

    const ctx = faceCanvas.getContext("2d")
    if (!ctx) return null

    // Mirror the image (since video is mirrored)
    ctx.translate(extractWidth, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(
      video,
      extractX,
      extractY,
      extractWidth,
      extractHeight,
      0,
      0,
      extractWidth,
      extractHeight
    )

    return faceCanvas
  }

  private drawAvatarFeatures(size: number): void {
    const { outlineColor, expression, type } = this.avatarStyle

    if (!this.ctx) return

    // Adjust feature positions based on avatar type
    const eyeY = type === "realistic" ? -size * 0.1 : -size * 0.15
    const mouthY = type === "realistic" ? size * 0.2 : size * 0.25
    const eyeSpacing = size * 0.25

    switch (expression) {
      case "happy":
        this.drawHappyEyes(eyeSpacing, eyeY, size, outlineColor)
        this.drawHappyMouth(mouthY, size, outlineColor)
        break
      case "serious":
        this.drawSeriousEyes(eyeSpacing, eyeY, size, outlineColor)
        this.drawSeriousMouth(mouthY, size, outlineColor)
        break
      default:
        this.drawNeutralEyes(eyeSpacing, eyeY, size, outlineColor)
        this.drawNeutralMouth(mouthY, size, outlineColor)
    }
  }

  private drawNeutralEyes(spacing: number, y: number, size: number, color: string): void {
    if (!this.ctx) return

    const eyeSize = size * 0.08

    // Eye whites
    this.ctx.beginPath()
    this.ctx.arc(-spacing, y, eyeSize, 0, Math.PI * 2)
    this.ctx.arc(spacing, y, eyeSize, 0, Math.PI * 2)
    this.ctx.fillStyle = "#ffffff"
    this.ctx.fill()
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = size * 0.02
    this.ctx.stroke()

    // Pupils
    this.ctx.beginPath()
    this.ctx.arc(-spacing, y, eyeSize * 0.5, 0, Math.PI * 2)
    this.ctx.arc(spacing, y, eyeSize * 0.5, 0, Math.PI * 2)
    this.ctx.fillStyle = "#1a1a1a"
    this.ctx.fill()
  }

  private drawHappyEyes(spacing: number, y: number, size: number, color: string): void {
    if (!this.ctx) return

    // Happy curved eyes (^_^)
    this.ctx.beginPath()
    this.ctx.arc(-spacing, y, size * 0.08, Math.PI, 0, false)
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = size * 0.04
    this.ctx.lineCap = "round"
    this.ctx.stroke()

    this.ctx.beginPath()
    this.ctx.arc(spacing, y, size * 0.08, Math.PI, 0, false)
    this.ctx.stroke()
  }

  private drawSeriousEyes(spacing: number, y: number, size: number, color: string): void {
    if (!this.ctx) return

    const eyeSize = size * 0.08

    // Eye whites
    this.ctx.beginPath()
    this.ctx.arc(-spacing, y, eyeSize, 0, Math.PI * 2)
    this.ctx.arc(spacing, y, eyeSize, 0, Math.PI * 2)
    this.ctx.fillStyle = "#ffffff"
    this.ctx.fill()
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = size * 0.02
    this.ctx.stroke()

    // Pupils (smaller, more serious)
    this.ctx.beginPath()
    this.ctx.arc(-spacing, y, eyeSize * 0.4, 0, Math.PI * 2)
    this.ctx.arc(spacing, y, eyeSize * 0.4, 0, Math.PI * 2)
    this.ctx.fillStyle = "#1a1a1a"
    this.ctx.fill()

    // Angry eyebrows
    this.ctx.beginPath()
    this.ctx.moveTo(-spacing - size * 0.12, y - size * 0.2)
    this.ctx.lineTo(-spacing + size * 0.08, y - size * 0.12)
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = size * 0.03
    this.ctx.lineCap = "round"
    this.ctx.stroke()

    this.ctx.beginPath()
    this.ctx.moveTo(spacing - size * 0.08, y - size * 0.12)
    this.ctx.lineTo(spacing + size * 0.12, y - size * 0.2)
    this.ctx.stroke()
  }

  private drawNeutralMouth(y: number, size: number, color: string): void {
    if (!this.ctx) return

    this.ctx.beginPath()
    this.ctx.moveTo(-size * 0.15, y)
    this.ctx.lineTo(size * 0.15, y)
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = size * 0.04
    this.ctx.lineCap = "round"
    this.ctx.stroke()
  }

  private drawHappyMouth(y: number, size: number, color: string): void {
    if (!this.ctx) return

    // Big smile
    this.ctx.beginPath()
    this.ctx.arc(0, y - size * 0.05, size * 0.2, 0.15 * Math.PI, 0.85 * Math.PI, false)
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = size * 0.04
    this.ctx.lineCap = "round"
    this.ctx.stroke()

    // Add tongue sometimes
    if (Math.random() > 0.5) {
      this.ctx.beginPath()
      this.ctx.arc(0, y + size * 0.05, size * 0.08, 0, Math.PI, false)
      this.ctx.fillStyle = "#ff6b8a"
      this.ctx.fill()
    }
  }

  private drawSeriousMouth(y: number, size: number, color: string): void {
    if (!this.ctx) return

    // Straight line mouth
    this.ctx.beginPath()
    this.ctx.moveTo(-size * 0.12, y)
    this.ctx.lineTo(size * 0.12, y)
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = size * 0.04
    this.ctx.lineCap = "round"
    this.ctx.stroke()
  }

  private lightenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace("#", ""), 16)
    const amt = Math.round(2.55 * percent)
    const R = Math.min(255, (num >> 16) + amt)
    const G = Math.min(255, ((num >> 8) & 0x00ff) + amt)
    const B = Math.min(255, (num & 0x0000ff) + amt)
    return `#${((1 << 24) | (R << 16) | (G << 8) | B).toString(16).slice(1)}`
  }

  private darkenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace("#", ""), 16)
    const amt = Math.round(2.55 * percent)
    const R = Math.max(0, (num >> 16) - amt)
    const G = Math.max(0, ((num >> 8) & 0x00ff) - amt)
    const B = Math.max(0, (num & 0x0000ff) - amt)
    return `#${((1 << 24) | (R << 16) | (G << 8) | B).toString(16).slice(1)}`
  }

  /**
   * Create a MediaStream from the canvas
   */
  createStream(): MediaStream | null {
    if (!this.canvas) return null
    return this.canvas.captureStream(30)
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stop()
    this.canvas = null
    this.ctx = null
    this.videoElement = null
  }
}

export const webGLAvatarRenderer = new WebGLAvatarRenderer()
