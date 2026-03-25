import { NextRequest, NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { reports, results, users } from '@/lib/db/schema'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { reportId } = await params

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1)

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Find report (must belong to user and be paid)
    const [report] = await db
      .select()
      .from(reports)
      .where(and(eq(reports.id, reportId), eq(reports.userId, user.id)))
      .limit(1)

    if (!report) {
      return NextResponse.json({ error: 'Relatório não encontrado' }, { status: 404 })
    }

    if (!report.isPaid) {
      return NextResponse.json({ error: 'Pagamento pendente' }, { status: 403 })
    }

    // Get full result
    const [result] = await db
      .select()
      .from(results)
      .where(eq(results.id, report.resultId))
      .limit(1)

    if (!result) {
      return NextResponse.json({ error: 'Resultado não encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      report: {
        id: report.id,
        unlockedAt: report.unlockedAt,
      },
      result: {
        score: result.score,
        maxScore: result.maxScore,
        percentile: result.percentile,
        attentionScore: result.attentionScore,
        logicScore: result.logicScore,
        profileSummary: result.profileSummary,
        detailedProfile: result.detailedProfile,
        adhdIndicator: result.adhdIndicator,
        cognitiveEstimate: result.cognitiveEstimate,
      },
    })
  } catch (error) {
    console.error('Error fetching report:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
