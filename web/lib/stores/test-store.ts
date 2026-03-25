import { create } from 'zustand'
import { Question, Answer } from '@/lib/tests/types'

export type TestPhase = 'idle' | 'loading' | 'active' | 'timeout' | 'error' | 'analyzing' | 'results'

interface TestStore {
  phase: TestPhase
  testType: 'attention' | 'logic' | 'full'
  sessionId: string | null
  currentQuestion: Question | null
  questionIndex: number
  totalQuestions: number
  answers: Answer[]
  timeRemaining: number
  score: number | null
  percentile: number | null
  resultId: string | null

  setPhase: (phase: TestPhase) => void
  setTestType: (type: 'attention' | 'logic' | 'full') => void
  setSessionId: (id: string) => void
  setCurrentQuestion: (q: Question | null) => void
  setQuestionIndex: (i: number) => void
  setTotalQuestions: (n: number) => void
  addAnswer: (a: Answer) => void
  setTimeRemaining: (t: number) => void
  setScore: (s: number) => void
  setPercentile: (p: number) => void
  setResultId: (id: string) => void
  reset: () => void
}

const initialState = {
  phase: 'idle' as TestPhase,
  testType: 'full' as const,
  sessionId: null,
  currentQuestion: null,
  questionIndex: 0,
  totalQuestions: 20,
  answers: [],
  timeRemaining: 0,
  score: null,
  percentile: null,
  resultId: null,
}

export const useTestStore = create<TestStore>((set) => ({
  ...initialState,
  setPhase: (phase) => set({ phase }),
  setTestType: (testType) => set({ testType }),
  setSessionId: (sessionId) => set({ sessionId }),
  setCurrentQuestion: (currentQuestion) => set({ currentQuestion }),
  setQuestionIndex: (questionIndex) => set({ questionIndex }),
  setTotalQuestions: (totalQuestions) => set({ totalQuestions }),
  addAnswer: (answer) => set((state) => ({ answers: [...state.answers, answer] })),
  setTimeRemaining: (timeRemaining) => set({ timeRemaining }),
  setScore: (score) => set({ score }),
  setPercentile: (percentile) => set({ percentile }),
  setResultId: (resultId) => set({ resultId }),
  reset: () => set(initialState),
}))
