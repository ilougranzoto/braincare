import { Brain } from 'lucide-react'
import Link from 'next/link'
import { ResultPageClient } from './client'
import type { Metadata } from 'next'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { results } from '@/lib/db/schema'

export async function generateMetadata({ params }: { params: Promise<{ sessionId: string }> }): Promise<Metadata> {
  const { sessionId } = await params

  try {
    const [result] = await db
      .select({ percentile: results.percentile })
      .from(results)
      .where(eq(results.sessionId, sessionId))
      .limit(1)

    if (result) {
      return {
        title: `Meu Perfil Cognitivo | BrainCare`,
        description: `Fiz um teste cognitivo e estou acima de ${result.percentile}% das pessoas! Faça o seu também.`,
        openGraph: {
          title: `Estou acima de ${result.percentile}% das pessoas!`,
          description: 'Descubra seu perfil cognitivo em 5 minutos. Teste gratuito de atenção e raciocínio lógico.',
          siteName: 'BrainCare',
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title: `Estou acima de ${result.percentile}% das pessoas!`,
          description: 'Descubra seu perfil cognitivo em 5 minutos.',
        },
      }
    }
  } catch {
    // fallback
  }

  return {
    title: 'Resultado | BrainCare',
    description: 'Descubra seu perfil cognitivo com BrainCare.',
  }
}

export default async function ResultPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-brand-600" />
            <span className="font-bold text-gray-900">BrainCare</span>
          </Link>
          <span className="text-sm text-gray-500">Seu Resultado</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-12">
        <ResultPageClient sessionId={sessionId} />
      </main>

      {/* Disclaimer */}
      <footer className="border-t border-gray-200 bg-gray-50 px-4 py-6">
        <p className="mx-auto max-w-2xl text-center text-xs text-gray-400">
          Este produto é apenas para fins informativos e não substitui avaliação profissional.
          Não fornece diagnóstico médico nem QI oficial.
        </p>
      </footer>
    </div>
  )
}
