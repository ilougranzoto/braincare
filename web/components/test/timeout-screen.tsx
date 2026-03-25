'use client'

import { Clock } from 'lucide-react'
import { motion } from 'framer-motion'

interface TimeoutScreenProps {
  onContinue: () => void
}

export function TimeoutScreen({ onContinue }: TimeoutScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12"
    >
      <div className="rounded-full bg-amber-100 p-4">
        <Clock className="h-8 w-8 text-amber-600" />
      </div>
      <p className="mt-4 text-lg font-semibold text-gray-700">Tempo esgotado</p>
      <p className="mt-2 text-gray-500">Não se preocupe, vamos para a próxima.</p>
      <button
        onClick={onContinue}
        className="mt-6 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700 transition-colors"
      >
        Próxima pergunta
      </button>
    </motion.div>
  )
}
