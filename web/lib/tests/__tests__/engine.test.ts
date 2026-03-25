import { describe, it, expect } from 'vitest'
import { createTestSession, getNextQuestion, submitAnswer, TOTAL_QUESTIONS } from '../engine'
import { attentionQuestions } from '../questions/attention'
import { logicQuestions } from '../questions/logic'

describe('createTestSession', () => {
  it('creates a valid session for attention test', () => {
    const state = createTestSession('attention')
    expect(state.testType).toBe('attention')
    expect(state.sessionId).toBeTruthy()
    expect(state.currentIndex).toBe(0)
    expect(state.answers).toHaveLength(0)
    expect(state.currentDifficulty).toBe(2)
    expect(state.consecutiveCorrect).toBe(0)
    expect(state.consecutiveWrong).toBe(0)
    expect(state.isComplete).toBe(false)
  })

  it('creates a valid session for logic test', () => {
    const state = createTestSession('logic')
    expect(state.testType).toBe('logic')
    expect(state.questions.length).toBeGreaterThanOrEqual(1)
  })

  it('creates a valid session for full test', () => {
    const state = createTestSession('full')
    expect(state.testType).toBe('full')
    expect(state.questions.length).toBeGreaterThanOrEqual(1)
  })

  it('pre-selects first question at medium difficulty', () => {
    const state = createTestSession('attention')
    expect(state.questions.length).toBe(1)
    expect(state.questions[0].difficulty).toBe(2)
  })

  it('generates a unique sessionId', () => {
    const s1 = createTestSession('attention')
    const s2 = createTestSession('attention')
    expect(s1.sessionId).not.toBe(s2.sessionId)
  })
})

describe('getNextQuestion', () => {
  it('returns the first question for a new session', () => {
    const state = createTestSession('attention')
    const question = getNextQuestion(state)
    expect(question).not.toBeNull()
    expect(question!.type).toBe('attention')
  })

  it('returns null when test is complete', () => {
    const state = createTestSession('attention')
    state.isComplete = true
    const question = getNextQuestion(state)
    expect(question).toBeNull()
  })

  it('returns null when all questions answered for attention (10)', () => {
    const state = createTestSession('attention')
    // Simulate 10 answers
    state.answers = attentionQuestions.slice(0, 10).map(q => ({
      questionId: q.id,
      answer: q.correctIndex,
      correct: true,
      responseTimeMs: 5000,
      difficulty: q.difficulty,
    }))
    const question = getNextQuestion(state)
    expect(question).toBeNull()
  })

  it('returns questions for logic test type', () => {
    const state = createTestSession('logic')
    const question = getNextQuestion(state)
    expect(question).not.toBeNull()
    expect(question!.type).toBe('logic')
  })

  it('returns questions from both types for full test', () => {
    const state = createTestSession('full')
    const question = getNextQuestion(state)
    expect(question).not.toBeNull()
    expect(['attention', 'logic']).toContain(question!.type)
  })
})

describe('submitAnswer', () => {
  it('updates state with a correct answer', () => {
    const state = createTestSession('attention')
    const question = getNextQuestion(state)!
    const newState = submitAnswer(state, question.id, question.correctIndex, 5000)

    expect(newState.answers).toHaveLength(1)
    expect(newState.answers[0].correct).toBe(true)
    expect(newState.currentIndex).toBe(1)
    expect(newState.consecutiveCorrect).toBe(1)
    expect(newState.consecutiveWrong).toBe(0)
  })

  it('updates state with a wrong answer', () => {
    const state = createTestSession('attention')
    const question = getNextQuestion(state)!
    const wrongAnswer = (question.correctIndex + 1) % question.options.length
    const newState = submitAnswer(state, question.id, wrongAnswer, 5000)

    expect(newState.answers).toHaveLength(1)
    expect(newState.answers[0].correct).toBe(false)
    expect(newState.consecutiveWrong).toBe(1)
    expect(newState.consecutiveCorrect).toBe(0)
  })

  it('returns same state for unknown question id', () => {
    const state = createTestSession('attention')
    const newState = submitAnswer(state, 'nonexistent-id', 0, 5000)
    expect(newState).toBe(state) // same reference, unchanged
  })

  it('records response time in the answer', () => {
    const state = createTestSession('attention')
    const question = getNextQuestion(state)!
    const newState = submitAnswer(state, question.id, question.correctIndex, 7500)
    expect(newState.answers[0].responseTimeMs).toBe(7500)
  })
})

describe('adaptive difficulty', () => {
  it('increases difficulty after 2 consecutive correct answers', () => {
    let state = createTestSession('attention')
    // Force difficulty to 2 (starting value)
    expect(state.currentDifficulty).toBe(2)

    // Find two medium difficulty attention questions
    const mediumQuestions = attentionQuestions.filter(q => q.difficulty === 2)

    // Answer first correctly
    state = submitAnswer(state, mediumQuestions[0].id, mediumQuestions[0].correctIndex, 5000)
    expect(state.currentDifficulty).toBe(2) // not yet increased

    // Answer second correctly
    state = submitAnswer(state, mediumQuestions[1].id, mediumQuestions[1].correctIndex, 5000)
    expect(state.currentDifficulty).toBe(3) // increased after 2 correct
  })

  it('decreases difficulty after 2 consecutive wrong answers', () => {
    let state = createTestSession('attention')
    expect(state.currentDifficulty).toBe(2)

    const mediumQuestions = attentionQuestions.filter(q => q.difficulty === 2)

    // Answer first wrong
    const wrongIdx1 = (mediumQuestions[0].correctIndex + 1) % mediumQuestions[0].options.length
    state = submitAnswer(state, mediumQuestions[0].id, wrongIdx1, 5000)
    expect(state.currentDifficulty).toBe(2) // not yet decreased

    // Answer second wrong
    const wrongIdx2 = (mediumQuestions[1].correctIndex + 1) % mediumQuestions[1].options.length
    state = submitAnswer(state, mediumQuestions[1].id, wrongIdx2, 5000)
    expect(state.currentDifficulty).toBe(1) // decreased after 2 wrong
  })

  it('does not increase difficulty above 3', () => {
    let state = createTestSession('attention')

    const mediumQuestions = attentionQuestions.filter(q => q.difficulty === 2)
    const hardQuestions = attentionQuestions.filter(q => q.difficulty === 3)

    // Get to difficulty 3
    state = submitAnswer(state, mediumQuestions[0].id, mediumQuestions[0].correctIndex, 5000)
    state = submitAnswer(state, mediumQuestions[1].id, mediumQuestions[1].correctIndex, 5000)
    expect(state.currentDifficulty).toBe(3)

    // Two more correct at difficulty 3
    state = submitAnswer(state, hardQuestions[0].id, hardQuestions[0].correctIndex, 5000)
    state = submitAnswer(state, hardQuestions[1].id, hardQuestions[1].correctIndex, 5000)
    expect(state.currentDifficulty).toBe(3) // stays at 3
  })

  it('does not decrease difficulty below 1', () => {
    let state = createTestSession('attention')

    const mediumQuestions = attentionQuestions.filter(q => q.difficulty === 2)
    const easyQuestions = attentionQuestions.filter(q => q.difficulty === 1)

    // Get to difficulty 1
    const w1 = (mediumQuestions[0].correctIndex + 1) % mediumQuestions[0].options.length
    const w2 = (mediumQuestions[1].correctIndex + 1) % mediumQuestions[1].options.length
    state = submitAnswer(state, mediumQuestions[0].id, w1, 5000)
    state = submitAnswer(state, mediumQuestions[1].id, w2, 5000)
    expect(state.currentDifficulty).toBe(1)

    // Two more wrong at difficulty 1
    const w3 = (easyQuestions[0].correctIndex + 1) % easyQuestions[0].options.length
    const w4 = (easyQuestions[1].correctIndex + 1) % easyQuestions[1].options.length
    state = submitAnswer(state, easyQuestions[0].id, w3, 5000)
    state = submitAnswer(state, easyQuestions[1].id, w4, 5000)
    expect(state.currentDifficulty).toBe(1) // stays at 1
  })

  it('resets consecutive count on alternating correct/wrong', () => {
    let state = createTestSession('attention')
    const questions = attentionQuestions.filter(q => q.difficulty === 2)

    // Correct
    state = submitAnswer(state, questions[0].id, questions[0].correctIndex, 5000)
    expect(state.consecutiveCorrect).toBe(1)

    // Wrong
    const wrongIdx = (questions[1].correctIndex + 1) % questions[1].options.length
    state = submitAnswer(state, questions[1].id, wrongIdx, 5000)
    expect(state.consecutiveCorrect).toBe(0)
    expect(state.consecutiveWrong).toBe(1)

    // Correct again
    state = submitAnswer(state, questions[2].id, questions[2].correctIndex, 5000)
    expect(state.consecutiveCorrect).toBe(1)
    expect(state.consecutiveWrong).toBe(0)

    // Difficulty should not have changed
    expect(state.currentDifficulty).toBe(2)
  })
})

describe('completion', () => {
  it('marks complete after 20 questions for full type', () => {
    let state = createTestSession('full')
    const allQuestions = [...attentionQuestions, ...logicQuestions]

    for (let i = 0; i < 20; i++) {
      const q = allQuestions[i]
      state = submitAnswer(state, q.id, q.correctIndex, 5000)
    }

    expect(state.isComplete).toBe(true)
    expect(state.answers).toHaveLength(20)
  })

  it('marks complete after 10 questions for attention type', () => {
    let state = createTestSession('attention')

    for (let i = 0; i < 10; i++) {
      const q = attentionQuestions[i]
      state = submitAnswer(state, q.id, q.correctIndex, 5000)
    }

    expect(state.isComplete).toBe(true)
    expect(state.answers).toHaveLength(10)
  })

  it('marks complete after 10 questions for logic type', () => {
    let state = createTestSession('logic')

    for (let i = 0; i < 10; i++) {
      const q = logicQuestions[i]
      state = submitAnswer(state, q.id, q.correctIndex, 5000)
    }

    expect(state.isComplete).toBe(true)
    expect(state.answers).toHaveLength(10)
  })

  it('is not complete before reaching question limit', () => {
    let state = createTestSession('attention')
    const q = attentionQuestions[0]
    state = submitAnswer(state, q.id, q.correctIndex, 5000)

    expect(state.isComplete).toBe(false)
  })
})

describe('TOTAL_QUESTIONS', () => {
  it('has correct counts for each test type', () => {
    expect(TOTAL_QUESTIONS.attention).toBe(10)
    expect(TOTAL_QUESTIONS.logic).toBe(10)
    expect(TOTAL_QUESTIONS.full).toBe(20)
  })
})
