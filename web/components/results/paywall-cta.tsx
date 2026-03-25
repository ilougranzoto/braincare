'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Sparkles, Check, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthModal } from '@/components/auth/auth-modal'
import { useAnonymousId } from '@/hooks/use-anonymous-id'
import { trackEvent } from '@/lib/analytics'

interface PaywallCtaProps {
  resultId: string
  sessionId: string
}

export function PaywallCta({ resultId, sessionId }: PaywallCtaProps) {
  const { data: session } = useSession()
  const anonymousId = useAnonymousId()
  const [showAuth, setShowAuth] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const features = [
    'Análise detalhada de atenção (sustentada, seletiva, dividida)',
    'Perfil completo de raciocínio lógico',
    'Estilo cognitivo personalizado',
    'Recomendações práticas baseadas no seu perfil',
    'Pontos fortes e áreas de melhoria',
  ]

  const handleUnlock = async () => {
    trackEvent('paywall_shown')

    if (!session) {
      trackEvent('auth_started', { method: 'paywall' })
      setShowAuth(true)
      return
    }

    // Link anonymous session if needed
    if (anonymousId) {
      await fetch('/api/auth/link-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anonymousId }),
      })
    }

    // Create checkout
    setIsLoading(true)
    trackEvent('payment_started')

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId }),
      })
      const data = await res.json()

      if (data.alreadyPaid) {
        window.location.href = `/relatorio/${data.reportId}`
        return
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="rounded-2xl border-2 border-brand-200 bg-gradient-to-b from-brand-50 to-white p-8">
        <div className="text-center">
          <Sparkles className="mx-auto h-8 w-8 text-brand-500" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            Desbloqueie seu perfil completo
          </h2>
          <p className="mt-2 text-gray-600">
            Descubra insights detalhados sobre como seu cérebro funciona
          </p>
        </div>

        <ul className="mt-6 space-y-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-500" />
              <span className="text-sm text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 text-center">
          <p className="text-3xl font-bold text-gray-900">
            R$ 29<span className="text-xl">,90</span>
          </p>
          <p className="mt-1 text-sm text-gray-500">Pagamento único</p>
        </div>

        <Button
          variant="accent"
          size="xl"
          className="mt-6 w-full"
          onClick={handleUnlock}
          isLoading={isLoading}
        >
          Desbloquear relatório
        </Button>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
          <Shield className="h-3 w-3" />
          Pagamento seguro via Stripe
        </div>
      </div>

      <AuthModal
        open={showAuth}
        onOpenChange={setShowAuth}
        callbackUrl={`/resultado/${sessionId}?unlock=true`}
      />
    </>
  )
}
