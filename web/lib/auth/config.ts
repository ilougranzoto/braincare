import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users, testSessions } from '@/lib/db/schema'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false

      try {
        // Find or create user
        const [existingUser] = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email))
          .limit(1)

        if (!existingUser) {
          await db.insert(users).values({
            email: user.email,
            name: user.name || null,
            provider: account?.provider || 'google',
            providerId: account?.providerAccountId || null,
          })
        }

        return true
      } catch (error) {
        console.error('Error in signIn callback:', error)
        return false
      }
    },
    async jwt({ token, trigger }) {
      if (trigger === 'signIn' && token.email) {
        // Link anonymous sessions to user
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, token.email))
          .limit(1)

        if (user) {
          token.userId = user.id
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId as string
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
  },
})
