import { webGLAvatarRenderer, AVATAR_STYLES, type AvatarStyle } from "./WebGLAvatarRenderer"

export type AvatarType = "illustrated" | "photorealistic" | "anime"

export interface AvatarPreset {
  id: string
  name: string
  type: AvatarType
  thumbnail: string
  avatarStyle: AvatarStyle
}

// Preset avatars
export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: "avatar-1",
    name: "Alex (Illustrated)",
    type: "illustrated",
    thumbnail: "/avatars/alex.png",
    avatarStyle: AVATAR_STYLES.illustrated,
  },
  {
    id: "avatar-2",
    name: "Sam (Anime)",
    type: "anime",
    thumbnail: "/avatars/sam.png",
    avatarStyle: AVATAR_STYLES.anime,
  },
  {
    id: "avatar-3",
    name: "Jordan (Realistic)",
    type: "photorealistic",
    thumbnail: "/avatars/jordan.png",
    avatarStyle: AVATAR_STYLES.realistic,
  },
]

export class AvatarService {
  private currentStream: MediaStream | null = null
  private selectedAvatar: AvatarPreset | null = null
  private avatarCanvas: HTMLCanvasElement | null = null
  private isActive = false
  private isInitialized = false

  /**
   * Initialize the avatar system with a canvas
   */
  async initialize(canvas: HTMLCanvasElement): Promise<void> {
    this.avatarCanvas = canvas
    await webGLAvatarRenderer.initialize(canvas)
    this.isInitialized = true
    console.log("[AvatarService] Initialized successfully")
  }

  /**
   * Select an avatar preset
   */
  selectAvatar(presetId: string): void {
    const preset = AVATAR_PRESETS.find((p) => p.id === presetId)
    if (preset) {
      this.selectedAvatar = preset
      webGLAvatarRenderer.setAvatarStyle(preset.avatarStyle)
      console.log(`[AvatarService] Avatar selected: ${preset.name}`)
    }
  }

  /**
   * List all available presets
   */
  listPresets(): AvatarPreset[] {
    return AVATAR_PRESETS
  }

  /**
   * Set the source video for avatar overlay
   */
  setSourceVideo(video: HTMLVideoElement | null): void {
    webGLAvatarRenderer.setVideoElement(video)
  }

  /**
   * Set avatar position (normalized 0-1)
   */
  setPosition(x: number, y: number): void {
    webGLAvatarRenderer.setAvatarPosition(x, y)
  }

  /**
   * Set avatar scale (0.5 - 2.0)
   */
  setScale(scale: number): void {
    webGLAvatarRenderer.setAvatarScale(scale)
  }

  /**
   * Start avatar rendering and return the output stream
   */
  start(sourceStream: MediaStream): MediaStream | null {
    if (!this.avatarCanvas) {
      console.error("[AvatarService] Canvas not initialized")
      return null
    }

    if (!this.isInitialized) {
      console.error("[AvatarService] Renderer not initialized")
      return null
    }

    // If no avatar selected, use first preset
    if (!this.selectedAvatar) {
      this.selectedAvatar = AVATAR_PRESETS[0]
      webGLAvatarRenderer.setAvatarStyle(AVATAR_PRESETS[0].avatarStyle)
    }

    // Create a video element from the source stream
    const video = document.createElement("video")
    video.srcObject = sourceStream
    video.autoplay = true
    video.playsInline = true
    video.muted = true // Mute to avoid feedback
    video.play().catch(console.error)

    // Set the video as the source
    webGLAvatarRenderer.setVideoElement(video)

    // Start rendering
    webGLAvatarRenderer.start()

    // Create output stream from canvas
    this.currentStream = this.avatarCanvas.captureStream(30)

    // Copy audio from source stream
    const audioTracks = sourceStream.getAudioTracks()
    audioTracks.forEach((track) => {
      this.currentStream!.addTrack(track.clone())
    })

    this.isActive = true
    console.log("[AvatarService] Avatar rendering started")
    return this.currentStream
  }

  /**
   * Stop avatar rendering
   */
  stop(): void {
    webGLAvatarRenderer.stop()
    this.isActive = false

    if (this.currentStream) {
      this.currentStream.getTracks().forEach((track) => track.stop())
      this.currentStream = null
    }
    console.log("[AvatarService] Avatar rendering stopped")
  }

  /**
   * Get current avatar preset
   */
  getCurrentAvatar(): AvatarPreset | null {
    return this.selectedAvatar
  }

  /**
   * Check if avatar is active
   */
  isRunning(): boolean {
    return this.isActive
  }

  /**
   * Check if avatar service is initialized
   */
  isReady(): boolean {
    return this.isInitialized
  }

  /**
   * Generate avatar from image (placeholder for AI integration)
   * In production, this could call D-ID, HeyGen, or similar API
   */
  async generateAvatar(
    _imageUrl: string,
    _type: AvatarType
  ): Promise<MediaStream | null> {
    // This requires external AI API integration
    console.warn("[AvatarService] Avatar generation requires external AI API integration (D-ID, HeyGen, etc.)")
    return null
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stop()
    this.avatarCanvas = null
    this.isInitialized = false
  }
}

// Singleton instance
export const avatarService = new AvatarService()
