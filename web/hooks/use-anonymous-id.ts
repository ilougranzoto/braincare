'use client'

import { useEffect, useState } from 'react'

const COOKIE_NAME = 'bc_anonymous_id'

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? decodeURIComponent(match[2]) : null
}

function setCookie(name: string, value: string, days: number = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

export function useAnonymousId(): string {
  const [id, setId] = useState<string>('')

  useEffect(() => {
    let anonymousId = getCookie(COOKIE_NAME)
    if (!anonymousId) {
      anonymousId = crypto.randomUUID()
      setCookie(COOKIE_NAME, anonymousId)
    }
    setId(anonymousId)
  }, [])

  return id
}
