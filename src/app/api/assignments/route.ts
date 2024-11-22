import { validateRequest } from '@/lib/auth'
import prisma from '@/lib/db'

type Schedule = {
    [day: string]: {
        [flight: string]: string[]
    }
}

export async function GET(request: Request) {
    try {
        const { user } = await validateRequest()

        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
        }

        const assignments = await prisma.flightAssignment.findMany({
            select: {
                userId: true,
                flight: true,
                day: true,
            },
        })

        const structuredAssignments = assignments.reduce((acc, assignment) => {
            const { day, flight, userId } = assignment
            if (!acc[day]) acc[day] = {}
            if (!acc[day][flight]) acc[day][flight] = []
            acc[day][flight].push(userId)
            return acc
        }, {} as Schedule)

        return new Response(JSON.stringify(structuredAssignments), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 400 })
    }
}

export async function POST(request: Request) {
    try {
        const { user } = await validateRequest()

        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
        }

        const body = await request.json()
        const { userId, day, flight } = body

        if (!userId || !day || !flight) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 })
        }

        const assignment = await prisma.flightAssignment.upsert({
            where: {
                user_flight_day_unique: { userId, day, flight },
            },
            create: {
                userId,
                day,
                flight,
                
            },
            update: {
                day,
                flight,
            },
        })

        return new Response(JSON.stringify(assignment), { status: 200 })
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 400 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { user } = await validateRequest();

        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');
        const day = url.searchParams.get('day');
        const flight = url.searchParams.get('flight');

        if (!userId || !day || !flight) {
            return new Response(JSON.stringify({ error: 'Missing required query parameters' }), { status: 400 });
        }

        // Delete the flight assignment
        await prisma.flightAssignment.delete({
            where: {
                user_flight_day_unique: { userId, day, flight }, // Use the unique constraint name
            },
        });

        return new Response(null, { status: 204 });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 400 });
    }
}

export async function PUT(request: Request) {
    try {
        const { user } = await validateRequest()

        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
        }

        const body = await request.json()
        const { currentUserId, newUserId, day, flight } = body

        if (!currentUserId || !newUserId || !day || !flight) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 })
        }

        // Remove current user
        await prisma.flightAssignment.delete({
            where: {
                user_flight_day_unique: { userId: currentUserId, day, flight },
            },
        })

        // Add new user
        const newAssignment = await prisma.flightAssignment.create({
            data: {
                userId: newUserId,
                day,
                flight,
            },
        })

        return new Response(JSON.stringify(newAssignment), { status: 200 })
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 400 })
    }
}