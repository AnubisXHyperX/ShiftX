import { validateRequest } from '@/lib/auth';
import prisma from '@/lib/db';


export async function POST(request: Request) {
    try {
        const { user } = await validateRequest();

        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const data: { [date: string]: { [hour: string]: boolean } } = await request.json(); // Parse JSON body
        console.log('Received blocks data:', data);

        const blocksToSave = Object.entries(data).map(([date, hours]) => ({
            userId: user.id,
            date: new Date(date),
            hours: hours, // Save hours as a JSON object
        }));

        // Upsert blocks in the database
        await prisma.$transaction(
            blocksToSave.map((block) =>
                prisma.block.upsert({
                    where: {
                        user_date_unique: {
                            userId: block.userId,
                            date: block.date,
                        },
                    },
                    update: { hours: block.hours },
                    create: { userId: block.userId, date: block.date, hours: block.hours },
                })
            )
        );

        return new Response(JSON.stringify({ message: 'Blocks saved successfully' }), { status: 200 });
    } catch (error) {
        console.error('Error saving blocks:', error);
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 400 });
    }
}

export async function GET(request: Request) {
    try {
        const { user } = await validateRequest();

        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const url = new URL(request.url);
        const weekStart = url.searchParams.get('weekStart'); // Get week start date
        if (!weekStart) {
            return new Response(JSON.stringify({ error: 'Missing weekStart parameter' }), { status: 400 });
        }

        const startDate = new Date(weekStart);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6); // Week ends after 7 days

        const blocks = await prisma.block.findMany({
            where: {
                userId: user.id,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                date: true,
                hours: true,
            },
        });

        const formattedBlocks: { [date: string]: { [hour: string]: boolean } } = {};
        blocks.forEach((block) => {
            const dateKey = block.date.toISOString().split('T')[0];
            if (block.hours && typeof block.hours === 'object') {
                formattedBlocks[dateKey] = block.hours as { [hour: string]: boolean };
            }
        });

        return new Response(JSON.stringify(formattedBlocks), { status: 200 });
    } catch (error) {
        console.error('Error fetching blocks:', error);
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 400 });
    }
}