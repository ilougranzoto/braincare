import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { results, testSessions } from '@/lib/db/schema'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params

    const [result] = await db
      .select({
        id: results.id,
        score: results.score,
        maxScore: results.maxScore,
        percentile: results.percentile,
        attentionScore: results.attentionScore,
        logicScore: results.logicScore,
        profileSummary: results.profileSummary,
        sessionId: results.sessionId,
      })
      .from(results)
      .where(eq(results.sessionId, sessionId))
      .limit(1)

    if (!result) {
      return NextResponse.json({ error: 'Resultado não encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      id: result.id,
      score: result.score,
      maxScore: result.maxScore,
      percentile: result.percentile,
      attentionScore: result.attentionScore,
      logicScore: result.logicScore,
      profileSummary: result.profileSummary,
    })
  } catch (error) {
    console.error('Error fetching results:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
