'use client'

import { motion } from 'framer-motion'
import { Brain, Activity, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ADHDIndicator } from '@/lib/tests/types'

interface PremiumIndicatorsProps {
  adhdIndicator: ADHDIndicator
  cognitiveEstimate: number
}

const adhdColors: Record<string, { bar: string; bg: string; text: string }> = {
  baixo: { bar: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-700' },
  moderado: { bar: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  elevado: { bar: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-700' },
  muito_elevado: { bar: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700' },
}

function getIQLabel(iq: number): { label: string; color: string } {
  if (iq >= 130) return { label: 'Muito Superior', color: 'text-purple-700' }
  if (iq >= 120) return { label: 'Superior', color: 'text-blue-700' }
  if (iq >= 110) return { label: 'Acima da Média', color: 'text-brand-700' }
  if (iq >= 90) return { label: 'Média', color: 'text-green-700' }
  if (iq >= 80) return { label: 'Abaixo da Média', color: 'text-amber-700' }
  return { label: 'Baixo', color: 'text-orange-700' }
}

function IndicatorBar({ value, max, colorClass }: { value: number; max: number; colorClass: string }) {
  const percentage = Math.min(100, (value / max) * 100)
  return (
    <div className="relative h-4 w-full overflow-hidden rounded-full bg-gray-200">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className={cn('h-full rounded-full', colorClass)}
      />
    </div>
  )
}

export function PremiumIndicators({ adhdIndicator, cognitiveEstimate }: PremiumIndicatorsProps) {
  const adhd = adhdColors[adhdIndicator.level]
  const iq = getIQLabel(cognitiveEstimate)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="space-y-6"
    >
      {/* Cognitive Estimate (IQ) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-brand-600" />
          <h3 className="text-lg font-bold text-gray-900">Estimativa Cognitiva</h3>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-4xl font-extrabold text-gray-900">{cognitiveEstimate}</p>
            <p className={cn('text-sm font-semibold', iq.color)}>{iq.label}</p>
          </div>
          <div className="text-right text-xs text-gray-400">
            <p>70 — 145</p>
            <p>escala estimada</p>
          </div>
        </div>
        <div className="mt-3">
          <IndicatorBar value={cognitiveEstimate - 70} max={75} colorClass="bg-gradient-to-r from-brand-400 to-brand-600" />
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-400">
          <span>70</span>
          <span>100</span>
          <span>130</span>
          <span>145</span>
        </div>
      </div>

      {/* ADHD Indicator */}
      <div className={cn('rounded-2xl border p-6', adhd.bg, 'border-gray-200')}>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-gray-700" />
          <h3 className="text-lg font-bold text-gray-900">Indicador de Atenção</h3>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-4xl font-extrabold text-gray-900">{adhdIndicator.score}</p>
            <p className={cn('text-sm font-semibold', adhd.text)}>{adhdIndicator.label}</p>
          </div>
          <div className="text-right text-xs text-gray-400">
            <p>0 — 100</p>
            <p>sinais de desatenção</p>
          </div>
        </div>
        <div className="mt-3">
          <IndicatorBar value={adhdIndicator.score} max={100} colorClass={adhd.bar} />
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-400">
          <span>Baixo</span>
          <span>Moderado</span>
          <span>Elevado</span>
          <span>Muito Elevado</span>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
        <p className="text-xs text-amber-700">
          Estes indicadores são estimativas baseadas em seu desempenho no teste e servem apenas para fins informativos e de autoavaliação.
          Não constituem diagnóstico médico nem substituem avaliação de profissionais de saúde.
        </p>
      </div>
    </motion.div>
  )
}
