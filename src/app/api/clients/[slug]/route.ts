import { validateRequest } from '@/lib/auth'
import prisma from '@/lib/db'

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { user } = await validateRequest()

  if (!user || user.role === 'EMPLOYEE') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clientId = params.slug
  if (!clientId || Array.isArray(clientId)) {
    return Response.json(
      { error: 'Missing or invalid clientId' },
      { status: 400 }
    )
  }

  try {
    const existingClient = await prisma.client.findUnique({
      where: { id: clientId, farmId: user.farmId },
    })

    if (!existingClient) {
      return Response.json({ error: 'Client not found' }, { status: 404 })
    }

    const data = await prisma.client.delete({
      where: { id: clientId, farmId: user.farmId },
    })

    return Response.json({ data: data }, { status: 200 })
  } catch (error) {
    return Response.json({ error: error }, { status: 400 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { user } = await validateRequest()

    if (!user || user.role === 'EMPLOYEE') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const clientId = params.slug

    if (!clientId || !body.phoneNumber || !body.email) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const data = await prisma.client.update({
      where: {
        id: clientId,
        farmId: user.farmId,
      },
      data: {
        name: body.name,
        phoneNumber: body.phoneNumber,
        email: body.email,
      },
    })

    return Response.json({ data: data }, { status: 200 })
  } catch (error) {
    return Response.json({ error: error }, { status: 400 })
  }
}
