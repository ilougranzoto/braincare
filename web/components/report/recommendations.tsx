'use client'

import { motion } from 'framer-motion'
import { Lightbulb, Brain, Zap, Heart } from 'lucide-react'

interface RecommendationsProps {
  general: string[]
  attention?: string[]
  logic?: string[]
}

export function Recommendations({ general, attention, logic }: RecommendationsProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
        <Lightbulb className="h-5 w-5 text-amber-500" /> Recomendações Personalizadas
      </h2>
      <div className="mt-6 space-y-6">
        {attention && attention.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-brand-700"><Brain className="h-4 w-4" /> Para Atenção</h3>
            <ul className="mt-2 space-y-2">
              {attention.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-400" />{rec}
                </li>
              ))}
            </ul>
          </div>
        )}
        {logic && logic.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-accent-700"><Zap className="h-4 w-4" /> Para Raciocínio Lógico</h3>
            <ul className="mt-2 space-y-2">
              {logic.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-400" />{rec}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-green-700"><Heart className="h-4 w-4" /> Saúde Cognitiva Geral</h3>
          <ul className="mt-2 space-y-2">
            {general.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-400" />{rec}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  )
}
