'use client'

import { Brain, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export function AnalyzingScreen() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <motion.div
        className="relative"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Brain className="h-20 w-20 text-brand-500" />
        <motion.div
          className="absolute -right-1 -top-1"
          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Sparkles className="h-6 w-6 text-accent-500" />
        </motion.div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 text-2xl font-bold text-gray-900"
      >
        Analisando seus resultados...
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-4 space-y-2 text-center"
      >
        <AnalysisStep delay={0.8} text="Calculando perfil de atenção" />
        <AnalysisStep delay={1.5} text="Avaliando raciocínio lógico" />
        <AnalysisStep delay={2.2} text="Gerando recomendações" />
      </motion.div>
    </div>
  )
}

function AnalysisStep({ delay, text }: { delay: number; text: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="text-gray-500"
    >
      {text}...
    </motion.p>
  )
}
