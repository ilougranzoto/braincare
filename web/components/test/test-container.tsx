'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTestStore } from '@/lib/stores/test-store'
import { useAnonymousId } from '@/hooks/use-anonymous-id'
import { Question } from '@/lib/tests/types'
import { trackEvent } from '@/lib/analytics'
import { LoadingScreen } from './loading-screen'
import { QuestionCard } from './question-card'
import { ProgressBar } from './progress-bar'
import { TimeoutScreen } from './timeout-screen'
import { AnalyzingScreen } from './analyzing-screen'

export function TestContainer() {
  const router = useRouter()
  const anonymousId = useAnonymousId()
  const store = useTestStore()
  const [showTimeout, setShowTimeout] = useState(false)

  // Start test on mount
  useEffect(() => {
    if (store.phase !== 'idle') return
    startTest()
  }, [anonymousId])

  async function startTest() {
    if (!anonymousId) return
    store.setPhase('loading')
    trackEvent('test_started', { type: 'full' })

    try {
      const res = await fetch('/api/test/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testType: 'full' }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Erro ao criar sessão')

      store.setSessionId(data.sessionId)
      store.setTotalQuestions(data.totalQuestions)
      store.setCurrentQuestion(data.firstQuestion)
      store.setPhase('active')
    } catch {
      store.setPhase('error')
    }
  }

  const handleAnswer = useCallback(
    async (answerIndex: number, responseTimeMs: number) => {
      const { sessionId, currentQuestion, questionIndex, totalQuestions } = useTestStore.getState()
      if (!sessionId || !currentQuestion) return

      try {
        const res = await fetch('/api/test/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            questionId: currentQuestion.id,
            answer: answerIndex,
            responseTimeMs,
          }),
        })
        const data = await res.json()

        store.addAnswer({
          questionId: currentQuestion.id,
          answer: answerIndex,
          correct: data.correct,
          responseTimeMs,
          difficulty: currentQuestion.difficulty,
        })

        if (data.isComplete) {
          await completeTest(sessionId)
        } else if (data.nextQuestion) {
          store.setCurrentQuestion(data.nextQuestion)
          store.setQuestionIndex(questionIndex + 1)
        }
      } catch {
        store.setPhase('error')
      }
    },
    []
  )

  const handleTimeout = useCallback(() => {
    setShowTimeout(true)
  }, [])

  const handleTimeoutContinue = useCallback(async () => {
    setShowTimeout(false)
    const { sessionId, currentQuestion, questionIndex } = useTestStore.getState()
    if (!sessionId || !currentQuestion) return

    // Submit timeout as wrong answer
    try {
      const res = await fetch('/api/test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.id,
          answer: -1, // timeout
          responseTimeMs: currentQuestion.timeLimitMs,
        }),
      })
      const data = await res.json()

      store.addAnswer({
        questionId: currentQuestion.id,
        answer: -1,
        correct: false,
        responseTimeMs: currentQuestion.timeLimitMs,
        difficulty: currentQuestion.difficulty,
      })

      if (data.isComplete) {
        await completeTest(sessionId)
      } else if (data.nextQuestion) {
        store.setCurrentQuestion(data.nextQuestion)
        store.setQuestionIndex(questionIndex + 1)
      }
    } catch {
      store.setPhase('error')
    }
  }, [])

  async function completeTest(sessionId: string) {
    store.setPhase('analyzing')

    try {
      const res = await fetch('/api/test/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
      const data = await res.json()

      trackEvent('test_completed', { score: data.score, percentile: data.percentile })

      // Wait for animation
      setTimeout(() => {
        router.push(`/resultado/${sessionId}`)
      }, 3500)
    } catch {
      store.setPhase('error')
    }
  }

  // Render based on phase
  if (store.phase === 'idle' || store.phase === 'loading') {
    return <LoadingScreen />
  }

  if (store.phase === 'analyzing') {
    return <AnalyzingScreen />
  }

  if (store.phase === 'error') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <p className="text-lg font-semibold text-red-600">Algo deu errado</p>
        <p className="mt-2 text-gray-500">Tente recarregar a página.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
        >
          Recarregar
        </button>
      </div>
    )
  }

  if (showTimeout) {
    return <TimeoutScreen onContinue={handleTimeoutContinue} />
  }

  if (store.phase === 'active' && store.currentQuestion) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-8">
        <ProgressBar
          current={store.questionIndex + 1}
          total={store.totalQuestions}
        />
        <div className="mt-8 w-full">
          <QuestionCard
            question={store.currentQuestion}
            onAnswer={handleAnswer}
            onTimeout={handleTimeout}
          />
        </div>
      </div>
    )
  }

  return <LoadingScreen />
}
