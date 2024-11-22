import { lucia } from '@/lib/auth'
import prisma from '@/lib/db'
import { hash } from '@node-rs/argon2'
import { generateIdFromEntropySize } from 'lucia'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function POST(request: Request) {
  if (process.env.SIGNUP_ALLOWED) {
    console.log(process.env.SIGNUP_ALLOWED)
    return Response.json('signup is not permitted in testing', { status: 405 })
  }
  const { email, password, englishName, hebrewName } = await request.json()
  //   // username must be between 4 ~ 31 characters, and only consists of lowercase letters, 0-9, -, and _
  //   // keep in mind some database (e.g. mysql) are case insensitive
  //   if (
  //     typeof email !== "string" ||
  //     email.length < 3 ||
  //     email.length > 31 ||
  //     !/^[a-z0-9_-]+$/.test(email)
  //   ) {
  //     return {
  //       error: "Invalid username",
  //     }
  //   }
  //   if (
  //     typeof password !== "string" ||
  //     password.length < 6 ||
  //     password.length > 255
  //   ) {
  //     return {
  //       error: "Invalid password",
  //     }
  //   }
  // if (!email.includes('challenge-group') || !email.includes('cal-cargo')) {
  //   return Response.json(
  //     { error: 'Email must be from challenge-group.com or cal-cargo.com' },
  //     { status: 400 }
  //   )
  // }
  const existingUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
  })

  if (existingUser) {
    return Response.json(
      { error: 'User with this email already exists' },
      { status: 409 }
    )
  }

  const passwordHash = await hash(password, {
    // recommended minimum parameters
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  })
  const userId = generateIdFromEntropySize(10) // 16 characters long

  const user = await prisma.user.create({
    data: {
      id: userId,
      name: englishName,
      email,
      passwordHash,
      hebrewName,
    },
  })

  const session = await lucia.createSession(userId, {})
  const sessionCookie = lucia.createSessionCookie(session.id)
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  )
  redirect('/')
}
