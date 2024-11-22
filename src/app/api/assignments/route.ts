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
        const { userId, flight, date } = await request.json();
        const formattedDate = new Date(date);

        // Check if the record already exists
        const existingAssignment = await prisma.flightAssignment.findFirst({
            where: { userId, flight, date: formattedDate },
        });

        if (existingAssignment) {
            return new Response(
                JSON.stringify({
                    error: `Assignment already exists for userId: ${userId}, flight: ${flight}, date: ${date}`,
                }),
                { status: 409 } // Conflict
            );
        }

        // Create a new assignment
        const assignment = await prisma.flightAssignment.create({
            data: { userId, flight, date: formattedDate },
        });

        return new Response(JSON.stringify(assignment), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
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
        const flight = url.searchParams.get('flight');
        const date = url.searchParams.get('date');

        if (!userId || !flight || !date) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
        }

        const formattedDate = new Date(date);

        // Delete the assignment safely
        const deleteResult = await prisma.flightAssignment.deleteMany({
            where: {
                userId,
                flight,
                date: formattedDate,
            },
        });

        if (deleteResult.count === 0) {
            return new Response(
                JSON.stringify({ error: 'No matching assignment found to delete.' }),
                { status: 404 }
            );
        }

        return new Response(null, { status: 204 });
    } catch (error) {
        console.error('DELETE Error:', error);
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { currentUserId, newUserId, flight, date } = await request.json();
        const formattedDate = new Date(date);

        // Perform atomic transaction
        const result = await prisma.$transaction([
            // Delete the existing assignment
            prisma.flightAssignment.deleteMany({
                where: { userId: currentUserId, flight, date: formattedDate },
            }),
            // Upsert the new assignment
            prisma.flightAssignment.upsert({
                where: {
                    user_flight_day_unique: {
                        userId: newUserId,
                        flight,
                        date: formattedDate,
                    },
                },
                create: { userId: newUserId, flight, date: formattedDate },
                update: {},
            }),
        ]);

        return new Response(JSON.stringify(result), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
    }
}