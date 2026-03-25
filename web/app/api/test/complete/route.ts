import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { testSessions, results } from '@/lib/db/schema'
import { calculateResults } from '@/lib/tests/scoring'
import { completeTestSchema } from '@/lib/validations/test'
import type { Answer } from '@/lib/tests/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = completeTestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const { sessionId } = parsed.data

    // Fetch session
    const [session] = await db
      .select()
      .from(testSessions)
      .where(eq(testSessions.id, sessionId))
      .limit(1)

    if (!session) {
      return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 })
    }

    // Check if results already exist
    const [existingResult] = await db
      .select()
      .from(results)
      .where(eq(results.sessionId, sessionId))
      .limit(1)

    if (existingResult) {
      return NextResponse.json({
        resultId: existingResult.id,
        score: existingResult.score,
        percentile: existingResult.percentile,
        profileSummary: existingResult.profileSummary,
      })
    }

    // Calculate results
    const answers = (session.answers as Answer[]) || []
    const testType = session.testType as 'attention' | 'logic' | 'full'
    const resultData = calculateResults(answers, testType)

    // Save results
    const [newResult] = await db
      .insert(results)
      .values({
        sessionId,
        score: resultData.score,
        maxScore: resultData.maxScore,
        percentile: resultData.percentile,
        attentionScore: resultData.attentionScore,
        logicScore: resultData.logicScore,
        profileSummary: resultData.profileSummary,
        detailedProfile: resultData.detailedProfile,
      })
      .returning()

    // Mark session as completed
    await db
      .update(testSessions)
      .set({
        status: 'completed',
        completedAt: new Date(),
      })
      .where(eq(testSessions.id, sessionId))

    return NextResponse.json({
      resultId: newResult.id,
      score: newResult.score,
      percentile: newResult.percentile,
      profileSummary: newResult.profileSummary,
    })
  } catch (error) {
    console.error('Error completing test:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
