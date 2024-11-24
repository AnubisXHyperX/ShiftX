import { validateRequest } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET(request: Request, { params }: { params: { slug: string } }) {
    const { user } = await validateRequest()

    if (!user || user.id !== params.slug) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    try {
        const assignments = await prisma.flightAssignment.findMany({
            where: { userId: params.slug },
            select: {
                date: true,
                flight: true,
            },
        })

        // Convert raw data into the desired array format
        const structuredAssignments = assignments.reduce((acc: { day: string; flights: { number: string; time: string; }[]; }[], assignment) => {
            const date = new Date(assignment.date).toISOString().split('T')[0]
            const existingDay = acc.find((a) => a.day === date)

            if (existingDay) {
                existingDay.flights.push({
                    number: assignment.flight,
                    time: new Date(assignment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                })
            } else {
                acc.push({
                    day: date,
                    flights: [
                        {
                            number: assignment.flight,
                            time: new Date(assignment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        },
                    ],
                })
            }
            return acc
        }, [])

        return new Response(JSON.stringify(structuredAssignments), { status: 200 })
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 400 })
    }
}