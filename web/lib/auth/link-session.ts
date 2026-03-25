import { eq, and, isNull } from 'drizzle-orm'
import { db } from '@/lib/db'
import { testSessions } from '@/lib/db/schema'

export async function linkAnonymousSession(anonymousId: string, userId: string) {
  try {
    await db
      .update(testSessions)
      .set({ userId })
      .where(
        and(
          eq(testSessions.anonymousId, anonymousId),
          isNull(testSessions.userId)
        )
      )
  } catch (error) {
    console.error('Error linking session:', error)
  }
}
