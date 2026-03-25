import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { testSessions } from '@/lib/db/schema'
import { createTestSession, getNextQuestion, TOTAL_QUESTIONS } from '@/lib/tests/engine'
import { createSessionSchema } from '@/lib/validations/test'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const rateLimitResponse = rateLimit(req, { limit: 5 })
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await req.json()
    const parsed = createSessionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const { testType } = parsed.data
    const cookieStore = await cookies()
    let anonymousId = cookieStore.get('bc_anonymous_id')?.value

    if (!anonymousId) {
      anonymousId = crypto.randomUUID()
    }

    // Create test state
    const testState = createTestSession(testType)
    const firstQuestion = getNextQuestion(testState)

    // Save to DB
    await db.insert(testSessions).values({
      id: testState.sessionId,
      anonymousId,
      testType,
      status: 'in_progress',
      answers: [],
      metadata: {
        currentDifficulty: testState.currentDifficulty,
        consecutiveCorrect: 0,
        consecutiveWrong: 0,
      },
    })

    const response = NextResponse.json({
      sessionId: testState.sessionId,
      totalQuestions: TOTAL_QUESTIONS[testType],
      firstQuestion: firstQuestion ? {
        id: firstQuestion.id,
        type: firstQuestion.type,
        difficulty: firstQuestion.difficulty,
        prompt: firstQuestion.prompt,
        options: firstQuestion.options,
        timeLimitMs: firstQuestion.timeLimitMs,
        category: firstQuestion.category,
      } : null,
    })

    // Set anonymous ID cookie if not present
    if (!cookieStore.get('bc_anonymous_id')) {
      response.cookies.set('bc_anonymous_id', anonymousId, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
      })
    }

    return response
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
