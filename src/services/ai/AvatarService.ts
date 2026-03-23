export type AvatarType = "illustrated" | "photorealistic" | "anime"

export interface AvatarPreset {
  id: string
  name: string
  type: AvatarType
  thumbnail: string
  modelUrl: string
}

export interface AvatarConfig {
  style: AvatarType
  voiceId?: string
}

// Preset avatars (placeholder)
export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: "avatar-1",
    name: "Alex (Illustrated)",
    type: "illustrated",
    thumbnail: "/avatars/alex.png",
    modelUrl: "/models/alex.glb",
  },
  {
    id: "avatar-2",
    name: "Sam (Anime)",
    type: "anime",
    thumbnail: "/avatars/sam.png",
    modelUrl: "/models/sam.glb",
  },
  {
    id: "avatar-3",
    name: "Jordan (Realistic)",
    type: "photorealistic",
    thumbnail: "/avatars/jordan.png",
    modelUrl: "/models/jordan.glb",
  },
]

export class AvatarService {
  private currentStream: MediaStream | null = null
  private selectedAvatar: AvatarPreset | null = null

  async selectAvatar(presetId: string): Promise<void> {
    const preset = AVATAR_PRESETS.find((p) => p.id === presetId)
    if (preset) {
      this.selectedAvatar = preset
      console.log(`Avatar selected: ${preset.name}`)
    }
  }

  listPresets(): AvatarPreset[] {
    return AVATAR_PRESETS
  }

  async generateAvatar(
    _imageUrl: string,
    _type: AvatarType
  ): Promise<MediaStream | null> {
    // This would integrate with AI avatar APIs like D-ID, HeyGen, or Synthesia
    // For now, return null as this requires external API
    console.warn("Avatar generation requires external API integration")
    return null
  }

  getCurrentAvatar(): AvatarPreset | null {
    return this.selectedAvatar
  }

  // Stop avatar stream and release resources
  stop(): void {
    if (this.currentStream) {
      this.currentStream.getTracks().forEach((track) => track.stop())
      this.currentStream = null
    }
    this.selectedAvatar = null
  }
}

// Singleton instance
export const avatarService = new AvatarService()
