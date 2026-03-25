'use client'

import { motion } from 'framer-motion'
import { Brain, Eye, Focus } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface AttentionProfileProps {
  data: {
    sustained: number
    selective: number
    divided: number
    summary: string
    recommendations: string[]
  }
}

export function AttentionProfile({ data }: AttentionProfileProps) {
  const dimensions = [
    { label: 'Atenção Sustentada', value: data.sustained, icon: Focus, desc: 'Capacidade de manter foco por períodos prolongados' },
    { label: 'Atenção Seletiva', value: data.selective, icon: Eye, desc: 'Habilidade de filtrar distrações' },
    { label: 'Atenção Dividida', value: data.divided, icon: Brain, desc: 'Monitorar múltiplas informações simultaneamente' },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
        <Brain className="h-5 w-5 text-brand-500" /> Perfil de Atenção
      </h2>
      <p className="mt-2 text-gray-600">{data.summary}</p>
      <div className="mt-6 space-y-5">
        {dimensions.map((dim) => (
          <div key={dim.label}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <dim.icon className="h-4 w-4 text-brand-500" />
                <span className="text-sm font-semibold text-gray-700">{dim.label}</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{dim.value}%</span>
            </div>
            <Progress value={dim.value} className="mt-2" />
            <p className="mt-1 text-xs text-gray-400">{dim.desc}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
