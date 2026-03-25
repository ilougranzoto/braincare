import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { reports } from '@/lib/db/schema'
import { stripe } from '@/lib/stripe/client'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const { resultId } = session.metadata || {}

      if (resultId) {
        await db
          .update(reports)
          .set({
            isPaid: true,
            stripePaymentIntentId: session.payment_intent as string,
            unlockedAt: new Date(),
          })
          .where(eq(reports.resultId, resultId))
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }
}
