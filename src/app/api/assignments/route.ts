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
                date: true,
            },
        })

        const structuredAssignments = assignments.reduce((acc, assignment) => {
            const { date, flight, userId } = assignment
            const day = new Date(date).toISOString().split('T')[0] // Format date to YYYY-MM-DD
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
        const { userId, date, flight } = body

        if (!userId || !date || !flight) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 })
        }

        const assignment = await prisma.flightAssignment.upsert({
            where: {
                user_flight_day_unique: { userId, flight, date: new Date(date) },
            },
            create: {
                userId,
                flight,
                date: new Date(date),
            },
            update: {
                flight,
                date: new Date(date),
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
            console.error('Unauthorized request');
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');
        const date = url.searchParams.get('date');
        const flight = url.searchParams.get('flight');

        if (!userId || !date || !flight) {
            console.error('Missing or invalid query parameters:', { userId, date, flight });
            return new Response(JSON.stringify({ error: 'Missing required query parameters' }), { status: 400 });
        }

        console.log('Deleting assignment:', { userId, date, flight });

        const result = await prisma.flightAssignment.delete({
            where: {
                user_flight_day_unique: { userId, flight, date: new Date(date) },
            },
        });

        console.log('Assignment deleted successfully:', result);
        return new Response(null, { status: 204 });
    } catch (error) {
        console.error('Error in DELETE handler:', error);
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
        const { currentUserId, newUserId, date, flight } = body

        if (!currentUserId || !newUserId || !date || !flight) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 })
        }

        // Remove current user
        await prisma.flightAssignment.delete({
            where: {
                user_flight_day_unique: { userId: currentUserId, flight, date: new Date(date) },
            },
        })

        // Add new user
        const newAssignment = await prisma.flightAssignment.create({
            data: {
                userId: newUserId,
                flight,
                date: new Date(date),
            },
        })

        return new Response(JSON.stringify(newAssignment), { status: 200 })
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 400 })
    }
}