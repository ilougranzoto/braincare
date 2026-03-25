type EventName =
  | 'test_started'
  | 'test_completed'
  | 'paywall_shown'
  | 'auth_started'
  | 'auth_completed'
  | 'payment_started'
  | 'payment_completed'
  | 'report_viewed'
  | 'share_whatsapp'
  | 'share_twitter'
  | 'share_copy'

export function trackEvent(event: EventName, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return

  // Placeholder for analytics integration (PostHog, Mixpanel, GA4)
  console.log(`[analytics] ${event}`, properties)
}
