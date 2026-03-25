'use client'

import { motion } from 'framer-motion'
import { Zap, GitBranch, Lightbulb, Grid3X3 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface LogicProfileProps {
  data: {
    deductive: number
    inductive: number
    patternRecognition: number
    summary: string
    recommendations: string[]
  }
}

export function LogicProfile({ data }: LogicProfileProps) {
  const dimensions = [
    { label: 'Raciocínio Dedutivo', value: data.deductive, icon: GitBranch, desc: 'Tirar conclusões lógicas a partir de premissas' },
    { label: 'Raciocínio Indutivo', value: data.inductive, icon: Lightbulb, desc: 'Identificar regras gerais a partir de exemplos' },
    { label: 'Reconhecimento de Padrões', value: data.patternRecognition, icon: Grid3X3, desc: 'Identificar sequências e relações' },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
        <Zap className="h-5 w-5 text-accent-500" /> Perfil de Raciocínio Lógico
      </h2>
      <p className="mt-2 text-gray-600">{data.summary}</p>
      <div className="mt-6 space-y-5">
        {dimensions.map((dim) => (
          <div key={dim.label}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <dim.icon className="h-4 w-4 text-accent-500" />
                <span className="text-sm font-semibold text-gray-700">{dim.label}</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{dim.value}%</span>
            </div>
            <Progress value={dim.value} className="mt-2" barClassName="bg-accent-500" />
            <p className="mt-1 text-xs text-gray-400">{dim.desc}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
