import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { results, reports, users } from '@/lib/db/schema'
import { stripe } from '@/lib/stripe/client'
import { STRIPE_CONFIG } from '@/lib/stripe/config'
import { createCheckoutSchema } from '@/lib/validations/test'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = createCheckoutSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const { resultId } = parsed.data

    // Find result
    const [result] = await db
      .select()
      .from(results)
      .where(eq(results.id, resultId))
      .limit(1)

    if (!result) {
      return NextResponse.json({ error: 'Resultado não encontrado' }, { status: 404 })
    }

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1)

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Check if already paid
    const [existingReport] = await db
      .select()
      .from(reports)
      .where(eq(reports.resultId, resultId))
      .limit(1)

    if (existingReport?.isPaid) {
      return NextResponse.json({
        reportId: existingReport.id,
        alreadyPaid: true,
      })
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: STRIPE_CONFIG.currency,
            product_data: {
              name: STRIPE_CONFIG.productName,
              description: 'Análise detalhada do seu perfil cognitivo com recomendações personalizadas.',
            },
            unit_amount: STRIPE_CONFIG.amount,
          },
          quantity: 1,
        },
      ],
      customer_email: session.user.email,
      metadata: {
        userId: user.id,
        resultId,
      },
      success_url: STRIPE_CONFIG.successUrl,
      cancel_url: STRIPE_CONFIG.cancelUrl,
    })

    // Create report record (unpaid)
    if (!existingReport) {
      await db.insert(reports).values({
        resultId,
        userId: user.id,
        isPaid: false,
        stripeCheckoutSessionId: checkoutSession.id,
      })
    } else {
      await db
        .update(reports)
        .set({ stripeCheckoutSessionId: checkoutSession.id })
        .where(eq(reports.id, existingReport.id))
    }

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
    })
  } catch (error) {
    console.error('Error creating checkout:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
