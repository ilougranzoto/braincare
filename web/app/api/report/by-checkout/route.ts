import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { reports } from '@/lib/db/schema'

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    const [report] = await db
      .select()
      .from(reports)
      .where(eq(reports.stripeCheckoutSessionId, sessionId))
      .limit(1)

    if (!report || !report.isPaid) {
      return NextResponse.json({ reportId: null })
    }

    return NextResponse.json({ reportId: report.id })
  } catch (error) {
    console.error('Error fetching report by checkout:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
