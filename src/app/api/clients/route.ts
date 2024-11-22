import { validateRequest } from '@/lib/auth'
import prisma from '@/lib/db'
import { clientsResponse } from '@/lib/types'

export async function GET(request: Request) {
  try {
    const { user } = await validateRequest()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = new URL(request.url).searchParams
    const clientId = searchParams.get('id')

    const data = await prisma.client.findMany({
      where: {
        farmId: user.farmId,
        id: clientId ? clientId : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
      },
    })

    const validation = clientsResponse.parse(data)

    return Response.json(data, { status: 200 })
  } catch (error) {
    return Response.json({ error: error }, { status: 400 })
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await validateRequest()
    const { name, email, phoneNumber } = await request.json()

    if (!user || user.role === 'EMPLOYEE') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    } else if (!name || !email || !phoneNumber) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 409 }
      )
    }

    const clientExists = await prisma.client.findFirst({
      where: {
        name: name,
        farmId: user.farmId,
      },
    })

    if (clientExists) {
      return Response.json({ error: 'Client already exists' }, { status: 409 })
    }

    const createClient = await prisma.client.create({
      data: {
        farmId: user.farmId,
        name: name,
        email: email,
        phoneNumber: phoneNumber,
      },
    })

    return Response.json(createClient, { status: 201 })
  } catch (error) {
    return Response.json({ error: error }, { status: 400 })
  }
}
