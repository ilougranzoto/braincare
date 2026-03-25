import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { linkAnonymousSession } from '@/lib/auth/link-session'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const rateLimitResponse = rateLimit(req, { limit: 5 })
  if (rateLimitResponse) return rateLimitResponse

  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { anonymousId } = await req.json()
    if (!anonymousId) {
      return NextResponse.json({ error: 'anonymousId obrigatório' }, { status: 400 })
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1)

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    await linkAnonymousSession(anonymousId, user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error linking session:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
