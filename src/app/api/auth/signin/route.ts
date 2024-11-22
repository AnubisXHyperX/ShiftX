import { lucia } from '@/lib/auth'
import prisma from '@/lib/db'
import { verify } from '@node-rs/argon2'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password } = body

        const user = await prisma.user.findFirst({ where: { email } })

        if (!user) {
            return NextResponse.json({
                error: "Invalid kaki"
            }, { status: 403 })
        }

        const isPasswordValid = await verify(user.passwordHash, password, {
            memoryCost: 19456,
            timeCost: 2,
            outputLen: 32,
            parallelism: 1,
        })

        if (!isPasswordValid) {
            return NextResponse.json({
                error: "Invalid pipi"
            }, { status: 403 })
        }

        // Create a new session using Lucia
        const session = await lucia.createSession(user.id, {})
        const sessionCookie = lucia.createSessionCookie(session.id)

        cookies().set(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes
        )

        // Remove password from user object
        const { passwordHash: _, ...userWithoutPassword } = user

        return NextResponse.json({
            user: userWithoutPassword,
            token: session.id
        })
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json({
            error: "Internal server error"
        }, { status: 500 })
    }
}