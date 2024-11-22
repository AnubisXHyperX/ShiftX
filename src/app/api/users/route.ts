import { validateRequest } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET(request: Request) {
    try {
        const { user } = await validateRequest()

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const searchParams = new URL(request.url).searchParams
        // const clientId = searchParams.get('id')

        const data = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                hebrewName: true,
                jobType: true,
                email: true,
            },
        })

        // const validation = clientsResponse.parse(data)

        return Response.json(data, { status: 200 })
    } catch (error) {
        return Response.json({ error: error }, { status: 400 })
    }
}