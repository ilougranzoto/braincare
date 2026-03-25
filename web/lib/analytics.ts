import posthog from 'posthog-js'

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

let initialized = false

function ensurePostHog() {
  if (typeof window === 'undefined' || initialized) return
  initialized = true

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'

  if (key) {
    posthog.init(key, {
      api_host: host,
      capture_pageview: true,
      capture_pageleave: true,
      persistence: 'localStorage+cookie',
    })
  }
}

export function trackEvent(event: EventName, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return

  ensurePostHog()

  if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.capture(event, properties)
  } else {
    // Fallback: log to console when PostHog is not configured
    console.log(`[analytics] ${event}`, properties)
  }
}
