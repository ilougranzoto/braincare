'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Question } from '@/lib/tests/types'
import { Timer } from './timer'

interface QuestionCardProps {
  question: Question
  onAnswer: (answerIndex: number, responseTimeMs: number) => void
  onTimeout: () => void
}

export function QuestionCard({ question, onAnswer, onTimeout }: QuestionCardProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(question.timeLimitMs)
  const startTimeRef = useRef(Date.now())
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setSelected(null)
    setTimeRemaining(question.timeLimitMs)
    startTimeRef.current = Date.now()

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const remaining = Math.max(0, question.timeLimitMs - elapsed)
      setTimeRemaining(remaining)

      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current)
        onTimeout()
      }
    }, 100)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [question.id, question.timeLimitMs, onTimeout])

  const handleSelect = useCallback(
    (index: number) => {
      if (selected !== null) return
      setSelected(index)
      if (timerRef.current) clearInterval(timerRef.current)
      const responseTimeMs = Date.now() - startTimeRef.current
      setTimeout(() => onAnswer(index, responseTimeMs), 300)
    },
    [selected, onAnswer]
  )

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl"
      >
        {/* Timer */}
        <div className="mb-6">
          <Timer remaining={timeRemaining} total={question.timeLimitMs} />
        </div>

        {/* Question */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
          <p className="text-center text-lg font-semibold text-gray-900 sm:text-xl">
            {question.prompt}
          </p>

          {/* Options */}
          <div className="mt-8 grid gap-3">
            {question.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={selected !== null}
                className={cn(
                  'w-full rounded-xl border-2 p-4 text-left text-base font-medium transition-all duration-200',
                  selected === i
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-brand-300 hover:bg-brand-50/50',
                  selected !== null && selected !== i && 'opacity-50'
                )}
              >
                <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">
                  {String.fromCharCode(65 + i)}
                </span>
                {option}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
