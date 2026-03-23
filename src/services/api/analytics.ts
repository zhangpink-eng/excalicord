// Analytics service (placeholder for PostHog integration)
export interface AnalyticsEvent {
  name: string
  properties?: Record<string, unknown>
}

class Analytics {
  private enabled = false

  init(apiKey: string): void {
    if (apiKey) {
      this.enabled = true
      console.log("Analytics initialized with key:", apiKey.slice(0, 8) + "...")
    }
  }

  track(event: AnalyticsEvent): void {
    if (!this.enabled) return
    // In production, this would send to PostHog
    console.log("Analytics event:", event)
  }

  identify(userId: string, traits?: Record<string, unknown>): void {
    if (!this.enabled) return
    // In production, this would identify user in PostHog
    console.log("Analytics identify:", userId, traits)
  }

  // Common events
  trackSignUp(method: "google" | "email", userId: string): void {
    this.track({ name: "sign_up", properties: { method, userId } })
  }

  trackProjectCreated(userId: string, projectId: string): void {
    this.track({ name: "project_created", properties: { userId, projectId } })
  }

  trackRecordingStarted(projectId: string): void {
    this.track({ name: "recording_started", properties: { projectId } })
  }

  trackExportStarted(projectId: string, format: string): void {
    this.track({ name: "export_started", properties: { projectId, format } })
  }

  trackExportCompleted(projectId: string, format: string, duration: number): void {
    this.track({ name: "export_completed", properties: { projectId, format, duration } })
  }

  trackSubscriptionUpgraded(userId: string, fromTier: string, toTier: string): void {
    this.track({ name: "subscription_upgraded", properties: { userId, fromTier, toTier } })
  }
}

export const analytics = new Analytics()
