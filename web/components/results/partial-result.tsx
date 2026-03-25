'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Brain, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface PartialResultProps {
  score: number
  maxScore: number
  percentile: number
  attentionScore: number | null
  logicScore: number | null
  profileSummary: string
}

export function PartialResult({
  score,
  maxScore,
  percentile,
  attentionScore,
  logicScore,
  profileSummary,
}: PartialResultProps) {
  const percentileVariant = percentile >= 70 ? 'success' : percentile >= 40 ? 'warning' : 'danger'

  return (
    <div className="space-y-6">
      {/* Percentile highlight */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <p className="text-sm text-gray-500">Seu resultado</p>
        <div className="mt-2 flex items-center justify-center gap-2">
          <TrendingUp className="h-6 w-6 text-brand-500" />
          <span className="text-4xl font-extrabold text-gray-900">{percentile}%</span>
        </div>
        <p className="mt-2 text-lg text-gray-700">
          Você está acima de <strong>{percentile}%</strong> das pessoas
        </p>
        <Badge variant={percentileVariant} className="mt-2">
          Percentil {percentile}
        </Badge>
      </motion.div>

      {/* Score breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 gap-4"
      >
        {attentionScore !== null && (
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
            <Brain className="mx-auto h-6 w-6 text-brand-500" />
            <p className="mt-2 text-2xl font-bold text-gray-900">{attentionScore}%</p>
            <p className="text-sm text-gray-500">Atenção</p>
          </div>
        )}
        {logicScore !== null && (
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
            <Zap className="mx-auto h-6 w-6 text-accent-500" />
            <p className="mt-2 text-2xl font-bold text-gray-900">{logicScore}%</p>
            <p className="text-sm text-gray-500">Lógica</p>
          </div>
        )}
      </motion.div>

      {/* Summary */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-gray-600"
      >
        {profileSummary}
      </motion.p>
    </div>
  )
}
