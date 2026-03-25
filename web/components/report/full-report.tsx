'use client'

import { motion } from 'framer-motion'
import { Brain, Zap, TrendingUp, Star, Target, ArrowUp } from 'lucide-react'
import type { DetailedProfile } from '@/lib/tests/types'
import { AttentionProfile } from './attention-profile'
import { LogicProfile } from './logic-profile'
import { Recommendations } from './recommendations'

interface FullReportProps {
  score: number
  maxScore: number
  percentile: number
  attentionScore: number | null
  logicScore: number | null
  profileSummary: string
  detailedProfile: DetailedProfile
}

export function FullReport({ score, maxScore, percentile, attentionScore, logicScore, profileSummary, detailedProfile }: FullReportProps) {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">Seu Perfil Cognitivo Completo</h1>
        <p className="mt-2 text-gray-600">{profileSummary}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-center text-white">
        <TrendingUp className="mx-auto h-8 w-8 text-brand-200" />
        <p className="mt-2 text-brand-200">Percentil Geral</p>
        <p className="mt-1 text-5xl font-extrabold">{percentile}%</p>
        <p className="mt-2 text-brand-200">Você supera {percentile}% das pessoas que fizeram este teste</p>
        <div className="mt-6 grid grid-cols-2 gap-4">
          {attentionScore !== null && (
            <div className="rounded-xl bg-white/10 p-4">
              <Brain className="mx-auto h-5 w-5 text-brand-200" />
              <p className="mt-1 text-2xl font-bold">{attentionScore}%</p>
              <p className="text-sm text-brand-200">Atenção</p>
            </div>
          )}
          {logicScore !== null && (
            <div className="rounded-xl bg-white/10 p-4">
              <Zap className="mx-auto h-5 w-5 text-brand-200" />
              <p className="mt-1 text-2xl font-bold">{logicScore}%</p>
              <p className="text-sm text-brand-200">Lógica</p>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900"><Star className="h-5 w-5 text-accent-500" /> Estilo Cognitivo</h2>
        <p className="mt-3 text-gray-700">{detailedProfile.overall.cognitiveStyle}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
          <h3 className="flex items-center gap-2 font-bold text-green-800"><Target className="h-5 w-5" /> Pontos Fortes</h3>
          <ul className="mt-3 space-y-2">
            {detailedProfile.overall.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-green-700">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500" />{s}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h3 className="flex items-center gap-2 font-bold text-amber-800"><ArrowUp className="h-5 w-5" /> Áreas de Melhoria</h3>
          <ul className="mt-3 space-y-2">
            {detailedProfile.overall.areasForImprovement.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />{a}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {detailedProfile.attention && <AttentionProfile data={detailedProfile.attention} />}
      {detailedProfile.logic && <LogicProfile data={detailedProfile.logic} />}

      <Recommendations general={detailedProfile.overall.recommendations} attention={detailedProfile.attention?.recommendations} logic={detailedProfile.logic?.recommendations} />

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center text-xs text-gray-400">
        Este relatório é apenas para fins informativos e de autoavaliação. Não substitui avaliação de profissionais de saúde.
      </div>
    </div>
  )
}
