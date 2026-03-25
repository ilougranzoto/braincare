import { pgTable, uuid, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  provider: text('provider').notNull(), // 'google' | 'email'
  providerId: text('provider_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const testSessions = pgTable('test_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  anonymousId: text('anonymous_id').notNull(),
  userId: uuid('user_id').references(() => users.id),
  testType: text('test_type').notNull(), // 'attention' | 'logic' | 'full'
  status: text('status').notNull().default('in_progress'), // 'in_progress' | 'completed' | 'abandoned'
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  answers: jsonb('answers').default([]),
  metadata: jsonb('metadata').default({}),
})

export const results = pgTable('results', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').notNull().references(() => testSessions.id),
  score: integer('score').notNull(),
  maxScore: integer('max_score').notNull(),
  percentile: integer('percentile').notNull(),
  attentionScore: integer('attention_score'),
  logicScore: integer('logic_score'),
  profileSummary: text('profile_summary'),
  detailedProfile: jsonb('detailed_profile'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const reports = pgTable('reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  resultId: uuid('result_id').notNull().references(() => results.id).unique(),
  userId: uuid('user_id').notNull().references(() => users.id),
  isPaid: boolean('is_paid').notNull().default(false),
  stripeCheckoutSessionId: text('stripe_checkout_session_id'),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  unlockedAt: timestamp('unlocked_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type TestSession = typeof testSessions.$inferSelect
export type NewTestSession = typeof testSessions.$inferInsert
export type Result = typeof results.$inferSelect
export type NewResult = typeof results.$inferInsert
export type Report = typeof reports.$inferSelect
export type NewReport = typeof reports.$inferInsert
