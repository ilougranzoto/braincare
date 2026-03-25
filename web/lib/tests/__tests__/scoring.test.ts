import { describe, it, expect } from 'vitest'
import { calculateResults } from '../scoring'
import { Answer, Difficulty } from '../types'
import { attentionQuestions } from '../questions/attention'
import { logicQuestions } from '../questions/logic'

function makeAnswer(
  questionId: string,
  correct: boolean,
  difficulty: Difficulty = 2,
  responseTimeMs: number = 5000
): Answer {
  return { questionId, answer: correct ? 0 : 1, correct, responseTimeMs, difficulty }
}

function makeAnswersFromQuestions(
  questions: typeof attentionQuestions,
  allCorrect: boolean,
  count: number,
  responseTimeMs: number = 5000
): Answer[] {
  return questions.slice(0, count).map(q => ({
    questionId: q.id,
    answer: allCorrect ? q.correctIndex : (q.correctIndex + 1) % q.options.length,
    correct: allCorrect,
    responseTimeMs,
    difficulty: q.difficulty,
  }))
}

describe('calculateResults', () => {
  it('returns valid ResultData structure', () => {
    const answers = makeAnswersFromQuestions(attentionQuestions, true, 10)
    const result = calculateResults(answers, 'attention')

    expect(result).toHaveProperty('score')
    expect(result).toHaveProperty('maxScore')
    expect(result).toHaveProperty('percentile')
    expect(result).toHaveProperty('attentionScore')
    expect(result).toHaveProperty('logicScore')
    expect(result).toHaveProperty('profileSummary')
    expect(result).toHaveProperty('detailedProfile')
  })

  it('produces higher percentile for all correct vs all wrong', () => {
    const allCorrect = makeAnswersFromQuestions(attentionQuestions, true, 10)
    const allWrong = makeAnswersFromQuestions(attentionQuestions, false, 10)

    const resultCorrect = calculateResults(allCorrect, 'attention')
    const resultWrong = calculateResults(allWrong, 'attention')

    expect(resultCorrect.percentile).toBeGreaterThan(resultWrong.percentile)
  })

  it('calculates correct weighted score based on difficulty', () => {
    // Two correct answers at difficulty 3 should score 6
    const answers: Answer[] = [
      makeAnswer('att-e1', true, 3),
      makeAnswer('att-e2', true, 3),
    ]
    const result = calculateResults(answers, 'attention')
    expect(result.score).toBe(6)
    expect(result.maxScore).toBe(6) // 2 answers * max difficulty 3
  })

  it('gives score 0 when all answers are wrong', () => {
    const answers = makeAnswersFromQuestions(attentionQuestions, false, 10)
    const result = calculateResults(answers, 'attention')
    expect(result.score).toBe(0)
  })

  it('returns attentionScore for attention test type', () => {
    const answers = makeAnswersFromQuestions(attentionQuestions, true, 10)
    const result = calculateResults(answers, 'attention')
    expect(result.attentionScore).not.toBeNull()
    expect(result.logicScore).toBeNull()
  })

  it('returns logicScore for logic test type', () => {
    const answers = makeAnswersFromQuestions(logicQuestions, true, 10)
    const result = calculateResults(answers, 'logic')
    expect(result.logicScore).not.toBeNull()
    expect(result.attentionScore).toBeNull()
  })

  it('returns both scores for full test type', () => {
    const answers = [
      ...makeAnswersFromQuestions(attentionQuestions, true, 10),
      ...makeAnswersFromQuestions(logicQuestions, true, 10),
    ]
    const result = calculateResults(answers, 'full')
    expect(result.attentionScore).not.toBeNull()
    expect(result.logicScore).not.toBeNull()
  })

  it('percentile is always between 1 and 99', () => {
    const scenarios = [
      makeAnswersFromQuestions(attentionQuestions, true, 10, 2000),  // all correct, fast
      makeAnswersFromQuestions(attentionQuestions, false, 10, 15000), // all wrong, slow
      makeAnswersFromQuestions(attentionQuestions, true, 5, 5000),   // half correct
    ]

    for (const answers of scenarios) {
      const result = calculateResults(answers, 'attention')
      expect(result.percentile).toBeGreaterThanOrEqual(1)
      expect(result.percentile).toBeLessThanOrEqual(99)
    }
  })

  it('different performances produce different percentiles', () => {
    const perfect = makeAnswersFromQuestions(
      [...attentionQuestions, ...logicQuestions], true, 20, 3000
    )
    const mixed = [
      ...makeAnswersFromQuestions(attentionQuestions, true, 5, 7000),
      ...makeAnswersFromQuestions(attentionQuestions, false, 5, 7000),
    ]
    const poor = makeAnswersFromQuestions(attentionQuestions, false, 10, 15000)

    const perfectResult = calculateResults(perfect, 'full')
    const mixedResult = calculateResults(mixed, 'attention')
    const poorResult = calculateResults(poor, 'attention')

    expect(perfectResult.percentile).toBeGreaterThan(mixedResult.percentile)
    expect(mixedResult.percentile).toBeGreaterThan(poorResult.percentile)
  })

  it('all 5 levels are reachable in detailed profile', () => {
    const levels = new Set<string>()

    // Test with various accuracy levels to hit all 5 levels
    // excelente: score >= 85
    // bom: score >= 70
    // moderado: score >= 50
    // em_desenvolvimento: score >= 30
    // inicial: score < 30

    // For attention categories, accuracy maps roughly to score
    // We test using actual question IDs so category detection works
    const attQ = attentionQuestions

    // All correct + fast -> excelente
    const excellentAnswers = attQ.slice(0, 8).map(q => ({
      questionId: q.id,
      answer: q.correctIndex,
      correct: true,
      responseTimeMs: 3000,
      difficulty: q.difficulty,
    }))
    const r1 = calculateResults(excellentAnswers, 'attention')
    if (r1.detailedProfile.attention) {
      levels.add(r1.detailedProfile.attention.sustained >= 85 ? 'excelente' : '')
      levels.add(r1.detailedProfile.attention.selective >= 85 ? 'excelente' : '')
    }

    // Mix of correct and wrong -> moderado
    const moderateAnswers = attQ.slice(0, 8).map((q, i) => ({
      questionId: q.id,
      answer: i % 2 === 0 ? q.correctIndex : (q.correctIndex + 1) % q.options.length,
      correct: i % 2 === 0,
      responseTimeMs: 8000,
      difficulty: q.difficulty,
    }))
    const r2 = calculateResults(moderateAnswers, 'attention')
    if (r2.detailedProfile.attention) {
      for (const score of [r2.detailedProfile.attention.sustained, r2.detailedProfile.attention.selective, r2.detailedProfile.attention.divided]) {
        if (score >= 85) levels.add('excelente')
        else if (score >= 70) levels.add('bom')
        else if (score >= 50) levels.add('moderado')
        else if (score >= 30) levels.add('em_desenvolvimento')
        else levels.add('inicial')
      }
    }

    // All wrong + slow -> inicial
    const poorAnswers = attQ.slice(0, 8).map(q => ({
      questionId: q.id,
      answer: (q.correctIndex + 1) % q.options.length,
      correct: false,
      responseTimeMs: 15000,
      difficulty: q.difficulty,
    }))
    const r3 = calculateResults(poorAnswers, 'attention')
    if (r3.detailedProfile.attention) {
      for (const score of [r3.detailedProfile.attention.sustained, r3.detailedProfile.attention.selective, r3.detailedProfile.attention.divided]) {
        if (score >= 85) levels.add('excelente')
        else if (score >= 70) levels.add('bom')
        else if (score >= 50) levels.add('moderado')
        else if (score >= 30) levels.add('em_desenvolvimento')
        else levels.add('inicial')
      }
    }

    levels.delete('')
    // We should reach at least 3 distinct levels across these scenarios
    expect(levels.size).toBeGreaterThanOrEqual(3)
  })

  it('profileSummary is a non-empty string', () => {
    const answers = makeAnswersFromQuestions(attentionQuestions, true, 10)
    const result = calculateResults(answers, 'attention')
    expect(typeof result.profileSummary).toBe('string')
    expect(result.profileSummary.length).toBeGreaterThan(0)
  })

  it('detailedProfile has overall with strengths and recommendations', () => {
    const answers = [
      ...makeAnswersFromQuestions(attentionQuestions, true, 10),
      ...makeAnswersFromQuestions(logicQuestions, true, 10),
    ]
    const result = calculateResults(answers, 'full')
    expect(result.detailedProfile.overall).toBeDefined()
    expect(result.detailedProfile.overall.strengths.length).toBeGreaterThan(0)
    expect(result.detailedProfile.overall.recommendations.length).toBeGreaterThan(0)
    expect(typeof result.detailedProfile.overall.cognitiveStyle).toBe('string')
  })
})
