'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, Brain, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { trackEvent } from '@/lib/analytics'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const [reportId, setReportId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    trackEvent('payment_completed')

    const sessionId = searchParams.get('session_id')
    if (sessionId) {
      pollForReport(sessionId)
    } else {
      setLoading(false)
    }
  }, [searchParams])

  async function pollForReport(stripeSessionId: string) {
    for (let i = 0; i < 10; i++) {
      try {
        const res = await fetch(`/api/report/by-checkout?sessionId=${stripeSessionId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.reportId) {
            setReportId(data.reportId)
            setLoading(false)
            return
          }
        }
      } catch {
        // ignore
      }
      await new Promise((r) => setTimeout(r, 2000))
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">Pagamento confirmado!</h1>
        <p className="mt-2 text-gray-600">Seu relatório cognitivo completo foi desbloqueado.</p>
        <div className="mt-8">
          {loading ? (
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Preparando seu relatório...</span>
            </div>
          ) : reportId ? (
            <Link href={`/relatorio/${reportId}`}>
              <Button variant="primary" size="lg">
                <Brain className="mr-2 h-5 w-5" />
                Ver meu relatório
              </Button>
            </Link>
          ) : (
            <Link href="/">
              <Button variant="primary" size="lg">
                <Brain className="mr-2 h-5 w-5" />
                Voltar ao início
              </Button>
            </Link>
          )}
        </div>
        <p className="mt-6 text-sm text-gray-400">Um email de confirmação foi enviado para sua conta.</p>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
