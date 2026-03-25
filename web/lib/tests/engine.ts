import { Question, Answer, TestState, Difficulty } from './types'
import { attentionQuestions } from './questions/attention'
import { logicQuestions } from './questions/logic'

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function getQuestionsByDifficulty(questions: Question[], difficulty: Difficulty): Question[] {
  return questions.filter(q => q.difficulty === difficulty)
}

function selectQuestion(
  allQuestions: Question[],
  difficulty: Difficulty,
  usedIds: Set<string>
): Question | null {
  const available = getQuestionsByDifficulty(allQuestions, difficulty)
    .filter(q => !usedIds.has(q.id))

  if (available.length === 0) {
    // Try adjacent difficulties
    const fallback = allQuestions.filter(q => !usedIds.has(q.id))
    return fallback.length > 0 ? fallback[Math.floor(Math.random() * fallback.length)] : null
  }

  return available[Math.floor(Math.random() * available.length)]
}

export function createTestSession(testType: 'attention' | 'logic' | 'full'): TestState {
  const questions: Question[] = []

  // Select initial questions at medium difficulty
  const pool = testType === 'attention'
    ? attentionQuestions
    : testType === 'logic'
    ? logicQuestions
    : [...attentionQuestions, ...logicQuestions]

  const usedIds = new Set<string>()
  const startDifficulty: Difficulty = 2

  // Pre-select first question
  const firstQ = selectQuestion(pool, startDifficulty, usedIds)
  if (firstQ) {
    questions.push(firstQ)
    usedIds.add(firstQ.id)
  }

  return {
    sessionId: crypto.randomUUID(),
    testType,
    questions,
    currentIndex: 0,
    answers: [],
    currentDifficulty: startDifficulty,
    consecutiveCorrect: 0,
    consecutiveWrong: 0,
    isComplete: false,
  }
}

export function getNextQuestion(state: TestState): Question | null {
  if (state.isComplete) return null

  const totalQuestions = state.testType === 'full' ? 20 : 10
  if (state.answers.length >= totalQuestions) return null

  if (state.currentIndex < state.questions.length) {
    return state.questions[state.currentIndex]
  }

  const pool = state.testType === 'attention'
    ? attentionQuestions
    : state.testType === 'logic'
    ? logicQuestions
    : [...attentionQuestions, ...logicQuestions]

  const usedIds = new Set(state.answers.map(a => a.questionId))
  const nextQ = selectQuestion(pool, state.currentDifficulty, usedIds)

  return nextQ
}

export function submitAnswer(
  state: TestState,
  questionId: string,
  answer: number,
  responseTimeMs: number
): TestState {
  const question = [...attentionQuestions, ...logicQuestions].find(q => q.id === questionId)
  if (!question) return state

  const correct = answer === question.correctIndex
  const newAnswer: Answer = {
    questionId,
    answer,
    correct,
    responseTimeMs,
    difficulty: question.difficulty,
  }

  const answers = [...state.answers, newAnswer]
  let { consecutiveCorrect, consecutiveWrong, currentDifficulty } = state

  if (correct) {
    consecutiveCorrect++
    consecutiveWrong = 0
    if (consecutiveCorrect >= 2 && currentDifficulty < 3) {
      currentDifficulty = (currentDifficulty + 1) as Difficulty
      consecutiveCorrect = 0
    }
  } else {
    consecutiveWrong++
    consecutiveCorrect = 0
    if (consecutiveWrong >= 2 && currentDifficulty > 1) {
      currentDifficulty = (currentDifficulty - 1) as Difficulty
      consecutiveWrong = 0
    }
  }

  const totalQuestions = state.testType === 'full' ? 20 : 10
  const isComplete = answers.length >= totalQuestions

  return {
    ...state,
    answers,
    currentIndex: state.currentIndex + 1,
    consecutiveCorrect,
    consecutiveWrong,
    currentDifficulty,
    isComplete,
  }
}

export function getCurrentQuestion(state: TestState): Question | null {
  return getNextQuestion(state)
}

export const TOTAL_QUESTIONS = {
  attention: 10,
  logic: 10,
  full: 20,
}
