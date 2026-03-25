'use client'

import { useEffect, useState } from 'react'
import { useSession, SessionProvider } from 'next-auth/react'
import { Brain } from 'lucide-react'
import Link from 'next/link'
import { FullReport } from '@/components/report/full-report'
import type { DetailedProfile } from '@/lib/tests/types'

interface ReportData {
  report: { id: string; unlockedAt: string }
  result: {
    score: number
    maxScore: number
    percentile: number
    attentionScore: number | null
    logicScore: number | null
    profileSummary: string
    detailedProfile: DetailedProfile
  }
}

function ReportContent({ reportId }: { reportId: string }) {
  const { data: session, status } = useSession()
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      setError('Faça login para ver seu relatório')
      setLoading(false)
      return
    }
    fetchReport()
  }, [status, session, reportId])

  async function fetchReport() {
    try {
      const res = await fetch(`/api/report/${reportId}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao carregar relatório')
      }
      setReport(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
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

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg font-semibold text-red-600">{error}</p>
        <Link href="/" className="mt-4 inline-block text-brand-600 hover:underline">Voltar ao início</Link>
      </div>
    )
  }

  if (!report) return null

  return (
    <FullReport
      score={report.result.score}
      maxScore={report.result.maxScore}
      percentile={report.result.percentile}
      attentionScore={report.result.attentionScore}
      logicScore={report.result.logicScore}
      profileSummary={report.result.profileSummary}
      detailedProfile={report.result.detailedProfile}
    />
  )
}

export default function ReportPage({ params }: { params: Promise<{ reportId: string }> }) {
  const [reportId, setReportId] = useState<string | null>(null)

  useEffect(() => {
    params.then(p => setReportId(p.reportId))
  }, [params])

  if (!reportId) return null

  return (
    <SessionProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-brand-600" />
              <span className="font-bold text-gray-900">BrainCare</span>
            </Link>
            <span className="text-sm text-gray-500">Relatório Completo</span>
          </div>
        </header>
        <main className="mx-auto max-w-2xl px-4 py-12">
          <ReportContent reportId={reportId} />
        </main>
      </div>
    </SessionProvider>
  )
}
