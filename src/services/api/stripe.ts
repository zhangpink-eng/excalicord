// Stripe client placeholder
// In production, this would be configured with actual Stripe credentials

export interface StripeConfig {
  publishableKey: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  features: string[]
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    features: ["10 min recording/month", "3 projects", "720p export"],
  },
  {
    id: "pro",
    name: "Professional",
    price: 1900, // cents
    features: ["60 min recording/month", "Unlimited projects", "1080p export", "AI avatars", "Beauty filters"],
  },
  {
    id: "team",
    name: "Team",
    price: 4900, // cents
    features: ["300 min recording/month", "Unlimited projects", "All formats", "AI avatars", "Beauty filters", "Team collaboration", "API access"],
  },
]

let stripeInstance: StripeConfig | null = null

export function initStripe(config: StripeConfig): void {
  stripeInstance = config
  console.log("Stripe initialized")
}

export function getStripe(): StripeConfig | null {
  return stripeInstance
}

export const payments = {
  createCheckoutSession: async (planId: string, userId: string) => {
    console.log("Payments createCheckoutSession:", planId, userId)
    return { url: null, error: null }
  },
  createPortalSession: async (customerId: string) => {
    console.log("Payments createPortalSession:", customerId)
    return { url: null, error: null }
  },
  getSubscription: async (customerId: string) => {
    console.log("Payments getSubscription:", customerId)
    return { subscription: null, error: null }
  },
}
