export const dynamic = 'force-dynamic'; // Ensure the route is treated as dynamic

import { lucia } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const sessionId = authHeader.split(' ')[1]
        const { session, user } = await lucia.validateSession(sessionId)

        if (!session || !user) {
            return NextResponse.json(
                { error: "Invalid session" },
                { status: 401 }
            )
        }

        // If session is close to expiry, create a new one
        if (session.fresh) {
            const newSessionId = session.id
            return NextResponse.json({
                user,
                token: newSessionId
            })
        }

        return NextResponse.json({ user })
    } catch (error) {
        console.error('Validation error:', error)
        return NextResponse.json(
            { error: "Invalid token" },
            { status: 401 }
        )
    }
}