import { lucia } from '@/lib/auth'
import prisma from '@/lib/db'
import { verify } from '@node-rs/argon2'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    //   if (
    //     typeof username !== "string" ||
    //     username.length < 3 ||
    //     username.length > 31 ||
    //     !/^[a-z0-9_-]+$/.test(username)
    //   ) {
    //     return {
    //       error: "Invalid username",
    //     }
    //   }
    //   const password = formData.get("password")
    //   if (
    //     typeof password !== "string" ||
    //     password.length < 6 ||
    //     password.length > 255
    //   ) {
    //     return {
    //       error: "Invalid password",
    //     }
    //   }

    const existingUser = await prisma.user.findFirst({ where: { email } })
    if (!existingUser) {
      // NOTE:
      // Returning immediately allows malicious actors to figure out valid usernames from response times,
      // allowing them to only focus on guessing passwords in brute-force attacks.
      // As a preventive measure, you may want to hash passwords even for invalid usernames.
      // However, valid usernames can be already be revealed with the signup page among other methods.
      // It will also be much more resource intensive.
      // Since protecting against this is non-trivial,
      // it is crucial your implementation is protected against brute-force attacks with login throttling etc.
      // If usernames are public, you may outright tell the user that the username is invalid.
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const validPassword = await verify(existingUser.passwordHash, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    })

    if (!validPassword) {
      return Response.json({ error: 'Incorrect password' }, { status: 401 })
    }

    const session = await lucia.createSession(existingUser.id, {})
    const sessionCookie = lucia.createSessionCookie(session.id)
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    )
  } catch (error) {
    console.error('Error during sign-in:', error)
    return Response.json(error, { status: 400 })
  }

  redirect('/')
}
