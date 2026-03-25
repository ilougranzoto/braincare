import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { testSessions } from '@/lib/db/schema'
import { submitAnswer, getNextQuestion, TOTAL_QUESTIONS } from '@/lib/tests/engine'
import { submitAnswerSchema } from '@/lib/validations/test'
import { attentionQuestions } from '@/lib/tests/questions/attention'
import { logicQuestions } from '@/lib/tests/questions/logic'
import type { TestState, Answer, Difficulty } from '@/lib/tests/types'

const allQuestions = [...attentionQuestions, ...logicQuestions]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = submitAnswerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const { sessionId, questionId, answer, responseTimeMs } = parsed.data

    // Anti-cheat: reject suspiciously fast answers
    if (responseTimeMs < 200 && answer !== -1) {
      return NextResponse.json({ error: 'Resposta muito rápida' }, { status: 400 })
    }

    // Fetch session
    const [session] = await db
      .select()
      .from(testSessions)
      .where(eq(testSessions.id, sessionId))
      .limit(1)

    if (!session) {
      return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 })
    }

    if (session.status !== 'in_progress') {
      return NextResponse.json({ error: 'Sessão já finalizada' }, { status: 400 })
    }

    // Find the question
    const question = allQuestions.find(q => q.id === questionId)
    if (!question) {
      return NextResponse.json({ error: 'Pergunta não encontrada' }, { status: 404 })
    }

    // Check if correct (answer -1 means timeout)
    const correct = answer >= 0 && answer === question.correctIndex

    // Rebuild test state from DB
    const existingAnswers = (session.answers as Answer[]) || []
    const metadata = (session.metadata as Record<string, unknown>) || {}

    const testState: TestState = {
      sessionId,
      testType: session.testType as 'attention' | 'logic' | 'full',
      questions: [],
      currentIndex: existingAnswers.length,
      answers: existingAnswers,
      currentDifficulty: (metadata.currentDifficulty as Difficulty) || 2,
      consecutiveCorrect: (metadata.consecutiveCorrect as number) || 0,
      consecutiveWrong: (metadata.consecutiveWrong as number) || 0,
      isComplete: false,
    }

    // Process the answer through the engine
    const newState = submitAnswer(testState, questionId, answer, responseTimeMs)
    const totalQuestions = TOTAL_QUESTIONS[newState.testType]
    const isComplete = newState.answers.length >= totalQuestions

    // Get next question if not complete
    let nextQuestion = null
    if (!isComplete) {
      const usedIds = new Set(newState.answers.map(a => a.questionId))
      const pool = newState.testType === 'attention'
        ? attentionQuestions
        : newState.testType === 'logic'
        ? logicQuestions
        : allQuestions

      const available = pool
        .filter(q => !usedIds.has(q.id) && q.difficulty === newState.currentDifficulty)

      if (available.length > 0) {
        const q = available[Math.floor(Math.random() * available.length)]
        nextQuestion = {
          id: q.id,
          type: q.type,
          difficulty: q.difficulty,
          prompt: q.prompt,
          options: q.options,
          timeLimitMs: q.timeLimitMs,
          category: q.category,
        }
      } else {
        // Fallback: any unused question
        const fallback = pool.filter(q => !usedIds.has(q.id))
        if (fallback.length > 0) {
          const q = fallback[Math.floor(Math.random() * fallback.length)]
          nextQuestion = {
            id: q.id,
            type: q.type,
            difficulty: q.difficulty,
            prompt: q.prompt,
            options: q.options,
            timeLimitMs: q.timeLimitMs,
            category: q.category,
          }
        }
      }
    }

    // Update session in DB
    await db
      .update(testSessions)
      .set({
        answers: newState.answers,
        metadata: {
          currentDifficulty: newState.currentDifficulty,
          consecutiveCorrect: newState.consecutiveCorrect,
          consecutiveWrong: newState.consecutiveWrong,
        },
        status: isComplete ? 'completed' : 'in_progress',
        completedAt: isComplete ? new Date() : undefined,
      })
      .where(eq(testSessions.id, sessionId))

    return NextResponse.json({
      correct,
      isComplete,
      nextQuestion,
      answersCount: newState.answers.length,
      totalQuestions,
    })
  } catch (error) {
    console.error('Error submitting answer:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
