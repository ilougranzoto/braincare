import { NextRequest, NextResponse } from 'next/server'

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}, 5 * 60 * 1000)

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = req.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }
  return '127.0.0.1'
}

/**
 * In-memory rate limiter for API routes.
 *
 * @param req - The incoming request
 * @param limit - Maximum number of requests allowed in the window
 * @param windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 * @returns null if the request is allowed, or a 429 NextResponse if rate limited
 */
export function rateLimit(
  req: NextRequest,
  { limit, windowMs = 60_000 }: { limit: number; windowMs?: number }
): NextResponse | null {
  const ip = getClientIp(req)
  const pathname = new URL(req.url).pathname
  const key = `${ip}:${pathname}`
  const now = Date.now()

  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return null
  }

  entry.count++

  if (entry.count > limit) {
    return NextResponse.json(
      { error: 'Muitas requisições. Tente novamente em alguns segundos.' },
      { status: 429 }
    )
  }

  return null
}
