'use client'

import { Brain } from 'lucide-react'
import { motion } from 'framer-motion'

export function LoadingScreen() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Brain className="h-16 w-16 text-brand-500" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 text-xl font-semibold text-gray-700"
      >
        Preparando seu teste...
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-2 text-gray-500"
      >
        Isso leva apenas alguns segundos
      </motion.p>
    </div>
  )
}
