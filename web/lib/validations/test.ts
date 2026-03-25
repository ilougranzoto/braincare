import { z } from 'zod'

export const createSessionSchema = z.object({
  testType: z.enum(['attention', 'logic', 'full']),
})

export const submitAnswerSchema = z.object({
  sessionId: z.string().uuid(),
  questionId: z.string(),
  answer: z.number().int().min(0).max(3),
  responseTimeMs: z.number().int().positive(),
})

export const completeTestSchema = z.object({
  sessionId: z.string().uuid(),
})

export const createCheckoutSchema = z.object({
  resultId: z.string().uuid(),
})
