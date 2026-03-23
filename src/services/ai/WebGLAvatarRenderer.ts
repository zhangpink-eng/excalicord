/**
 * WebGL Avatar Renderer
 *
 * A WebGL-based renderer for displaying animated avatar overlays on video.
 * Uses simple 2D transformations to simulate an avatar effect.
 */

export interface AvatarStyle {
  color: string
  outlineColor: string
  expression: "neutral" | "happy" | "serious"
}

export const AVATAR_STYLES: Record<string, AvatarStyle> = {
  illustrated: {
    color: "#4A90D9",
    outlineColor: "#2D5A87",
    expression: "neutral",
  },
  anime: {
    color: "#FF6B9D",
    outlineColor: "#CC4D73",
    expression: "happy",
  },
  realistic: {
    color: "#8B6914",
    outlineColor: "#5C4A0F",
    expression: "neutral",
  },
}

export class WebGLAvatarRenderer {
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private videoElement: HTMLVideoElement | null = null
  private isRendering = false
  private animationFrameId: number | null = null

  // Avatar state
  private avatarStyle: AvatarStyle = AVATAR_STYLES.illustrated
  private avatarPosition = { x: 0.5, y: 0.5 } // Normalized 0-1
  private avatarScale = 1.0
  private avatarRotation = 0

  initialize(canvas: HTMLCanvasElement): void {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")
  }

  setVideoElement(video: HTMLVideoElement | null): void {
    this.videoElement = video
  }

  setAvatarStyle(style: AvatarStyle): void {
    this.avatarStyle = style
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
    this.renderLoop()
  }

  /**
   * Stop the avatar render loop
   */
  stop(): void {
    this.isRendering = false
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  /**
   * Render a single frame
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

    // Draw video frame if available
    if (this.videoElement && this.videoElement.readyState >= 2) {
      this.drawVideoFrame()
    }

    // Draw avatar overlay
    this.drawAvatarOverlay()
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

  private drawAvatarOverlay(): void {
    if (!this.ctx || !this.canvas) return

    const { width, height } = this.canvas
    const centerX = this.avatarPosition.x * width
    const centerY = this.avatarPosition.y * height

    const avatarSize = Math.min(width, height) * 0.25 * this.avatarScale

    this.ctx.save()
    this.ctx.translate(centerX, centerY)
    this.ctx.rotate(this.avatarRotation)

    // Draw avatar based on style
    switch (this.avatarStyle.expression) {
      case "happy":
        this.drawHappyAvatar(avatarSize)
        break
      case "serious":
        this.drawSeriousAvatar(avatarSize)
        break
      default:
        this.drawNeutralAvatar(avatarSize)
    }

    this.ctx.restore()
  }

  private drawNeutralAvatar(size: number): void {
    if (!this.ctx) return
    const { color, outlineColor } = this.avatarStyle

    // Face circle
    this.ctx.beginPath()
    this.ctx.arc(0, 0, size, 0, Math.PI * 2)
    this.ctx.fillStyle = color
    this.ctx.fill()
    this.ctx.strokeStyle = outlineColor
    this.ctx.lineWidth = size * 0.05
    this.ctx.stroke()

    // Eyes
    const eyeOffset = size * 0.3
    const eyeSize = size * 0.1

    this.ctx.beginPath()
    this.ctx.arc(-eyeOffset, -size * 0.1, eyeSize, 0, Math.PI * 2)
    this.ctx.arc(eyeOffset, -size * 0.1, eyeSize, 0, Math.PI * 2)
    this.ctx.fillStyle = "#ffffff"
    this.ctx.fill()
    this.ctx.strokeStyle = outlineColor
    this.ctx.lineWidth = size * 0.03
    this.ctx.stroke()

    // Pupils
    this.ctx.beginPath()
    this.ctx.arc(-eyeOffset, -size * 0.1, eyeSize * 0.5, 0, Math.PI * 2)
    this.ctx.arc(eyeOffset, -size * 0.1, eyeSize * 0.5, 0, Math.PI * 2)
    this.ctx.fillStyle = "#1a1a1a"
    this.ctx.fill()

    // Mouth (neutral line)
    this.ctx.beginPath()
    this.ctx.moveTo(-size * 0.2, size * 0.3)
    this.ctx.lineTo(size * 0.2, size * 0.3)
    this.ctx.strokeStyle = outlineColor
    this.ctx.lineWidth = size * 0.05
    this.ctx.lineCap = "round"
    this.ctx.stroke()
  }

  private drawHappyAvatar(size: number): void {
    if (!this.ctx) return
    const { color, outlineColor } = this.avatarStyle

    // Face circle
    this.ctx.beginPath()
    this.ctx.arc(0, 0, size, 0, Math.PI * 2)
    this.ctx.fillStyle = color
    this.ctx.fill()
    this.ctx.strokeStyle = outlineColor
    this.ctx.lineWidth = size * 0.05
    this.ctx.stroke()

    // Eyes (happy - closed arcs)
    const eyeOffset = size * 0.3

    this.ctx.beginPath()
    this.ctx.arc(-eyeOffset, -size * 0.1, size * 0.1, 0, Math.PI, false)
    this.ctx.strokeStyle = outlineColor
    this.ctx.lineWidth = size * 0.05
    this.ctx.stroke()

    this.ctx.beginPath()
    this.ctx.arc(eyeOffset, -size * 0.1, size * 0.1, 0, Math.PI, false)
    this.ctx.stroke()

    // Mouth (smile)
    this.ctx.beginPath()
    this.ctx.arc(0, size * 0.1, size * 0.25, 0.2 * Math.PI, 0.8 * Math.PI, false)
    this.ctx.strokeStyle = outlineColor
    this.ctx.lineWidth = size * 0.05
    this.ctx.lineCap = "round"
    this.ctx.stroke()
  }

  private drawSeriousAvatar(size: number): void {
    if (!this.ctx) return
    const { color, outlineColor } = this.avatarStyle

    // Face circle
    this.ctx.beginPath()
    this.ctx.arc(0, 0, size, 0, Math.PI * 2)
    this.ctx.fillStyle = color
    this.ctx.fill()
    this.ctx.strokeStyle = outlineColor
    this.ctx.lineWidth = size * 0.05
    this.ctx.stroke()

    // Eyes (serious - straight brows)
    const eyeOffset = size * 0.3
    const eyeSize = size * 0.1

    this.ctx.beginPath()
    this.ctx.arc(-eyeOffset, -size * 0.1, eyeSize, 0, Math.PI * 2)
    this.ctx.arc(eyeOffset, -size * 0.1, eyeSize, 0, Math.PI * 2)
    this.ctx.fillStyle = "#ffffff"
    this.ctx.fill()
    this.ctx.strokeStyle = outlineColor
    this.ctx.lineWidth = size * 0.03
    this.ctx.stroke()

    // Pupils
    this.ctx.beginPath()
    this.ctx.arc(-eyeOffset, -size * 0.1, eyeSize * 0.5, 0, Math.PI * 2)
    this.ctx.arc(eyeOffset, -size * 0.1, eyeSize * 0.5, 0, Math.PI * 2)
    this.ctx.fillStyle = "#1a1a1a"
    this.ctx.fill()

    // Eyebrows (angled for serious look)
    this.ctx.beginPath()
    this.ctx.moveTo(-eyeOffset - size * 0.15, -size * 0.35)
    this.ctx.lineTo(-eyeOffset + size * 0.15, -size * 0.25)
    this.ctx.strokeStyle = outlineColor
    this.ctx.lineWidth = size * 0.04
    this.ctx.lineCap = "round"
    this.ctx.stroke()

    this.ctx.beginPath()
    this.ctx.moveTo(eyeOffset - size * 0.15, -size * 0.25)
    this.ctx.lineTo(eyeOffset + size * 0.15, -size * 0.35)
    this.ctx.stroke()

    // Mouth (straight line)
    this.ctx.beginPath()
    this.ctx.moveTo(-size * 0.15, size * 0.35)
    this.ctx.lineTo(size * 0.15, size * 0.35)
    this.ctx.strokeStyle = outlineColor
    this.ctx.lineWidth = size * 0.05
    this.ctx.stroke()
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
