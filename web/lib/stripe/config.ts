export const STRIPE_CONFIG = {
  priceId: process.env.STRIPE_PRICE_ID!,
  currency: 'brl',
  productName: 'Relatório Cognitivo Completo - BrainCare',
  amount: 1297, // R$12.97 in centavos
  successUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/pagamento/sucesso?session_id={CHECKOUT_SESSION_ID}`,
  cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/pagamento/cancelado`,
}
