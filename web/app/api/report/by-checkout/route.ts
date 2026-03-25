import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { reports } from '@/lib/db/schema'
import { stripe } from '@/lib/stripe/client'

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    // Find report by checkout session
    const [report] = await db
      .select()
      .from(reports)
      .where(eq(reports.stripeCheckoutSessionId, sessionId))
      .limit(1)

    if (!report) {
      return NextResponse.json({ reportId: null })
    }

    // If already paid, return immediately
    if (report.isPaid) {
      return NextResponse.json({ reportId: report.id })
    }

    // If not paid yet, verify directly with Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId)

    if (checkoutSession.payment_status === 'paid') {
      // Mark as paid (webhook might not have fired yet)
      await db
        .update(reports)
        .set({
          isPaid: true,
          stripePaymentIntentId: checkoutSession.payment_intent as string,
          unlockedAt: new Date(),
        })
        .where(eq(reports.id, report.id))

      return NextResponse.json({ reportId: report.id })
    }

    return NextResponse.json({ reportId: null })
  } catch (error) {
    console.error('Error fetching report by checkout:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
