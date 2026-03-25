export type QuestionType = 'attention' | 'logic'
export type Difficulty = 1 | 2 | 3

export interface Question {
  id: string
  type: QuestionType
  difficulty: Difficulty
  prompt: string
  options: string[]
  correctIndex: number
  timeLimitMs: number
  explanation: string
  category: string
}

export interface Answer {
  questionId: string
  answer: number
  correct: boolean
  responseTimeMs: number
  difficulty: Difficulty
}

export interface TestState {
  sessionId: string
  testType: 'attention' | 'logic' | 'full'
  questions: Question[]
  currentIndex: number
  answers: Answer[]
  currentDifficulty: Difficulty
  consecutiveCorrect: number
  consecutiveWrong: number
  isComplete: boolean
}

export interface ResultData {
  score: number
  maxScore: number
  percentile: number
  attentionScore: number | null
  logicScore: number | null
  profileSummary: string
  detailedProfile: DetailedProfile
}

export interface DetailedProfile {
  attention: {
    sustained: number
    selective: number
    divided: number
    summary: string
    recommendations: string[]
  } | null
  logic: {
    deductive: number
    inductive: number
    patternRecognition: number
    summary: string
    recommendations: string[]
  } | null
  overall: {
    strengths: string[]
    areasForImprovement: string[]
    cognitiveStyle: string
    recommendations: string[]
  }
}
