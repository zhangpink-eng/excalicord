import posthog from "posthog-js"

export interface AnalyticsEvent {
  name: string
  properties?: Record<string, unknown>
}

class Analytics {
  private enabled = false

  init(apiKey: string, options?: { debug?: boolean }): void {
    if (!apiKey) {
      console.warn("Analytics: No API key provided")
      return
    }

    posthog.init(apiKey, {
      debug: options?.debug ?? false,
      loaded: (ph) => {
        console.log("PostHog loaded:", ph)
      },
    })

    this.enabled = true
    console.log("Analytics initialized with PostHog")
  }

  track(event: AnalyticsEvent): void {
    if (!this.enabled) return
    posthog.capture(event.name, event.properties)
  }

  identify(userId: string, traits?: Record<string, unknown>): void {
    if (!this.enabled) return
    posthog.identify(userId, traits)
  }

  reset(): void {
    if (!this.enabled) return
    posthog.reset()
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

  trackRecordingStopped(projectId: string, duration: number): void {
    this.track({ name: "recording_stopped", properties: { projectId, duration } })
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

  trackPageView(page: string): void {
    this.track({ name: "$pageview", properties: { page } })
  }

  // Feature flags
  isFeatureEnabled(flag: string): boolean {
    if (!this.enabled) return false
    return posthog.isFeatureEnabled(flag) ?? false
  }
}

export const analytics = new Analytics()
