import { validateRequest } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(request: Request, { params }: { params: { slug: string } }) {
    const { user } = await validateRequest();

    if (!user || user.id !== params.slug) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        // Fetch all assignments for the user
        const assignments = await prisma.flightAssignment.findMany({
            where: { userId: params.slug },
            select: {
                flight: true,
                date: true,
            },
        });

        if (assignments.length === 0) {
            return new Response(JSON.stringify({ error: 'No assignments found' }), { status: 404 });
        }

        // Fetch all assignments for flights on the same dates (to include other users)
        const allAssignments = await prisma.flightAssignment.findMany({
            where: {
                date: {
                    in: assignments.map((a) => a.date),
                },
            },
            select: {
                flight: true,
                date: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        hebrewName: true,
                        jobType: true,
                    },
                },
            },
        });

        // Group assignments by day and flight
        const structuredAssignments = assignments.reduce(
            (acc: { day: string; flights: { number: string; time: string; users: { id: string; name: string; role: string }[] }[] }[], assignment) => {
                const day = new Date(assignment.date).toISOString().split('T')[0];
                const flightNumber = assignment.flight;

                // Find all users assigned to the same flight on the same date
                const flightUsers = allAssignments
                    .filter((fa) => fa.flight === flightNumber && fa.date.getTime() === assignment.date.getTime())
                    .map((fa) => ({
                        id: fa.user.id,
                        name: fa.user.name,
                        hebrewName: fa.user.hebrewName,
                        role: fa.user.jobType,
                    }));

                // Find the existing day entry
                const existingDay = acc.find((a) => a.day === day);

                const flightData = {
                    number: flightNumber,
                    time: new Date(assignment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    users: flightUsers,
                };

                if (existingDay) {
                    // Append flight to the existing day
                    existingDay.flights.push(flightData);
                } else {
                    // Add a new day entry
                    acc.push({
                        day,
                        flights: [flightData],
                    });
                }

                return acc;
            },
            []
        );

        return new Response(JSON.stringify(structuredAssignments), { status: 200 });
    } catch (error) {
        console.error('GET Error:', error);
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 400 });
    }
}