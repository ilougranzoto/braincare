'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SessionProvider } from 'next-auth/react'
import { PartialResult } from '@/components/results/partial-result'
import { ShareButtons } from '@/components/results/share-buttons'
import { LockedSection } from '@/components/results/locked-section'
import { PaywallCta } from '@/components/results/paywall-cta'
import { trackEvent } from '@/lib/analytics'

interface ResultData {
  id: string
  score: number
  maxScore: number
  percentile: number
  attentionScore: number | null
  logicScore: number | null
  profileSummary: string
}

export function ResultPageClient({ sessionId }: { sessionId: string }) {
  const [result, setResult] = useState<ResultData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchResults()
    trackEvent('paywall_shown')
  }, [sessionId])

  async function fetchResults() {
    try {
      const res = await fetch(`/api/results/${sessionId}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setResult(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg font-semibold text-red-600">Resultado não encontrado</p>
        <p className="mt-2 text-gray-500">Verifique se o link está correto.</p>
      </div>
    )
  }

  return (
    <SessionProvider>
      <div className="space-y-8">
        {/* Partial results - visible */}
        <PartialResult
          score={result.score}
          maxScore={result.maxScore}
          percentile={result.percentile}
          attentionScore={result.attentionScore}
          logicScore={result.logicScore}
          profileSummary={result.profileSummary}
        />

        {/* Share */}
        <ShareButtons percentile={result.percentile} sessionId={sessionId} />

        {/* Locked sections preview */}
        <div className="space-y-4">
          <LockedSection title="Estimativa Cognitiva (QI)" />
          <LockedSection title="Indicador de Atenção (TDAH)" />
          <LockedSection title="Perfil de Atenção Detalhado" />
          <LockedSection title="Perfil de Raciocínio Lógico" />
          <LockedSection title="Recomendações Personalizadas" />
        </div>

        {/* Paywall CTA */}
        <PaywallCta resultId={result.id} sessionId={sessionId} />
      </div>
    </SessionProvider>
  )
}
