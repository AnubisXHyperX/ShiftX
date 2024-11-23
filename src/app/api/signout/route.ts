import { lucia, validateRequest } from '@/lib/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function POST(request: Request) {
  const { session } = await validateRequest()
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await lucia.invalidateSession(session.id)

  const sessionCookie = lucia.createBlankSessionCookie()
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  )
  redirect('/login')
}