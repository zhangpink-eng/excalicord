export interface User {
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
  subscriptionTier: 'free' | 'pro' | 'team'
  subscriptionStatus: 'active' | 'canceled' | 'past_due'
}

export interface Project {
  id: string
  ownerId: string
  title: string
  description?: string
  thumbnailUrl?: string
  isPublished: boolean
  publishedSlug?: string
  settings: ProjectSettings
  createdAt: string
  updatedAt: string
}

export interface ProjectSettings {
  theme?: 'light' | 'dark'
  canvasBackground?: string
}

export interface Slide {
  id: string
  projectId: string
  name: string
  position: number
  content: SlideContent
  slideType: 'slide' | 'section'
  backgroundStyle: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface SlideContent {
  elements?: unknown[]
}

export type RecordingState = 'idle' | 'countdown' | 'recording' | 'paused' | 'stopped'

export interface RecordingSession {
  id: string
  projectId: string
  state: RecordingState
  duration: number
  startedAt?: string
  stoppedAt?: string
}

export type ExportFormat = 'mp4' | 'webm' | 'gif'

export interface ExportOptions {
  format: ExportFormat
  quality: 'low' | 'medium' | 'high' | 'ultra'
  fps: number
  width?: number
  height?: number
}
