import { describe, it, expect, vi, beforeEach } from 'vitest'

// The rate-limit module uses setInterval at module level, which triggers in jsdom.
// We need to mock NextRequest and NextResponse since they come from next/server.

// Mock next/server
vi.mock('next/server', () => {
  class MockHeaders {
    private headers: Record<string, string>
    constructor(init?: Record<string, string>) {
      this.headers = init || {}
    }
    get(name: string) {
      return this.headers[name.toLowerCase()] || null
    }
  }

  class MockNextRequest {
    url: string
    headers: MockHeaders
    constructor(url: string, options?: { headers?: Record<string, string> }) {
      this.url = url
      this.headers = new MockHeaders(options?.headers || {})
    }
  }

  class MockNextResponse {
    body: unknown
    status: number
    constructor(body: unknown, init?: { status?: number }) {
      this.body = body
      this.status = init?.status || 200
    }
    static json(body: unknown, init?: { status?: number }) {
      return new MockNextResponse(body, init)
    }
  }

  return {
    NextRequest: MockNextRequest,
    NextResponse: MockNextResponse,
  }
})

// Import after mocking
import { rateLimit } from '../rate-limit'
import { NextRequest } from 'next/server'

function createMockRequest(ip: string = '192.168.1.1', path: string = '/api/test'): NextRequest {
  return new NextRequest(`http://localhost${path}`, {
    headers: { 'x-forwarded-for': ip },
  }) as unknown as NextRequest
}

describe('rateLimit', () => {
  beforeEach(() => {
    // Reset the module-level rateLimitMap by re-importing would be complex,
    // so we use unique IPs per test to avoid conflicts
  })

  it('allows requests under the limit', () => {
    const ip = `10.0.0.${Math.floor(Math.random() * 255)}`
    const req = createMockRequest(ip, '/api/under-limit')

    const result1 = rateLimit(req, { limit: 5, windowMs: 60000 })
    expect(result1).toBeNull()

    const result2 = rateLimit(req, { limit: 5, windowMs: 60000 })
    expect(result2).toBeNull()

    const result3 = rateLimit(req, { limit: 5, windowMs: 60000 })
    expect(result3).toBeNull()
  })

  it('blocks requests over the limit', () => {
    const ip = `10.1.0.${Math.floor(Math.random() * 255)}`
    const path = `/api/over-limit-${Date.now()}`
    const req = createMockRequest(ip, path)

    // Make requests up to the limit
    for (let i = 0; i < 3; i++) {
      const result = rateLimit(req, { limit: 3, windowMs: 60000 })
      expect(result).toBeNull()
    }

    // Next request should be blocked (count becomes 4, which is > 3)
    const blocked = rateLimit(req, { limit: 3, windowMs: 60000 })
    expect(blocked).not.toBeNull()
    expect((blocked as any).status).toBe(429)
  })

  it('allows requests after window expires', () => {
    const ip = `10.2.0.${Math.floor(Math.random() * 255)}`
    const path = `/api/window-expire-${Date.now()}`
    const req = createMockRequest(ip, path)

    // Use a very short window
    const windowMs = 1 // 1ms window

    // First request
    const result1 = rateLimit(req, { limit: 1, windowMs })
    expect(result1).toBeNull()

    // Wait for the window to expire (we use a synchronous approach by manipulating Date.now)
    const originalNow = Date.now
    Date.now = () => originalNow() + windowMs + 1

    // After window expires, should be allowed again
    const result2 = rateLimit(req, { limit: 1, windowMs })
    expect(result2).toBeNull()

    // Restore
    Date.now = originalNow
  })

  it('tracks different IPs separately', () => {
    const path = `/api/diff-ips-${Date.now()}`
    const req1 = createMockRequest('172.16.0.1', path)
    const req2 = createMockRequest('172.16.0.2', path)

    // Fill up limit for IP 1
    rateLimit(req1, { limit: 1, windowMs: 60000 })
    const blocked = rateLimit(req1, { limit: 1, windowMs: 60000 })
    expect(blocked).not.toBeNull()

    // IP 2 should still be allowed
    const allowed = rateLimit(req2, { limit: 1, windowMs: 60000 })
    expect(allowed).toBeNull()
  })

  it('tracks different paths separately', () => {
    const ip = `10.3.0.${Math.floor(Math.random() * 255)}`
    const path1 = `/api/path-a-${Date.now()}`
    const path2 = `/api/path-b-${Date.now()}`
    const req1 = createMockRequest(ip, path1)
    const req2 = createMockRequest(ip, path2)

    // Fill up limit for path 1
    rateLimit(req1, { limit: 1, windowMs: 60000 })
    const blocked = rateLimit(req1, { limit: 1, windowMs: 60000 })
    expect(blocked).not.toBeNull()

    // Path 2 should still be allowed
    const allowed = rateLimit(req2, { limit: 1, windowMs: 60000 })
    expect(allowed).toBeNull()
  })

  it('uses default window of 60 seconds when not specified', () => {
    const ip = `10.4.0.${Math.floor(Math.random() * 255)}`
    const path = `/api/default-window-${Date.now()}`
    const req = createMockRequest(ip, path)

    // Should work without specifying windowMs
    const result = rateLimit(req, { limit: 10 })
    expect(result).toBeNull()
  })
})
