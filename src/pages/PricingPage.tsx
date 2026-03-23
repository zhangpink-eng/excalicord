import { useState } from "react"
import { Button } from "@/components/ui"
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from "@/services/api/stripe"

interface PricingPageProps {
  onSelectPlan: (planId: string) => void
  onClose: () => void
  currentPlan?: string
}

export function PricingPage({ onSelectPlan, onClose, currentPlan }: PricingPageProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleSelectPlan = async (planId: string) => {
    if (planId === "free" || planId === currentPlan) {
      onClose()
      return
    }

    setIsLoading(planId)
    try {
      await onSelectPlan(planId)
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Choose Your Plan</h2>
            <p className="text-muted-foreground mt-1">Select the plan that best fits your needs</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                isCurrentPlan={plan.id === currentPlan}
                isLoading={isLoading === plan.id}
                onSelect={() => handleSelectPlan(plan.id)}
              />
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="p-6 border-t bg-muted/30">
          <h3 className="font-semibold mb-4">Frequently Asked Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <FAQItem
              question="Can I cancel anytime?"
              answer="Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period."
            />
            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept all major credit cards (Visa, Mastercard, American Express) and PayPal."
            />
            <FAQItem
              question="Can I upgrade or downgrade?"
              answer="Yes, you can change your plan at any time. Changes take effect immediately."
            />
            <FAQItem
              question="Is there a free trial?"
              answer="Yes! Our Free plan includes 10 minutes of recording per month so you can try before you buy."
            />
          </div>
        </div>
      </div>
    </div>
  )
}

interface PricingCardProps {
  plan: SubscriptionPlan
  isCurrentPlan: boolean
  isLoading: boolean
  onSelect: () => void
}

function PricingCard({ plan, isCurrentPlan, isLoading, onSelect }: PricingCardProps) {
  const isPro = plan.id === "pro"

  return (
    <div
      className={`
        relative rounded-xl border-2 p-6 transition-all
        ${isPro ? "border-primary shadow-lg scale-105" : "border-border"}
        ${isCurrentPlan ? "bg-muted/30" : "bg-white"}
      `}
    >
      {isPro && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">{plan.name}</h3>
        <div className="mt-2">
          <span className="text-4xl font-bold">${(plan.price / 100).toFixed(0)}</span>
          {plan.price > 0 && (
            <span className="text-muted-foreground">/month</span>
          )}
        </div>
      </div>

      <ul className="space-y-3 mb-6">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary mt-0.5 shrink-0"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        className="w-full"
        variant={isPro ? "default" : "outline"}
        disabled={isCurrentPlan || isLoading}
        onClick={onSelect}
      >
        {isLoading ? (
          "Loading..."
        ) : isCurrentPlan ? (
          "Current Plan"
        ) : plan.price === 0 ? (
          "Get Started"
        ) : (
          "Subscribe"
        )}
      </Button>
    </div>
  )
}

interface FAQItemProps {
  question: string
  answer: string
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 text-left flex items-center justify-between"
      >
        <span className="font-medium">{question}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-3 pb-3 text-sm text-muted-foreground">
          {answer}
        </div>
      )}
    </div>
  )
}
