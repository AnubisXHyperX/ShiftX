'WIP'
// import { validateRequest } from "@/lib/auth";

export async function token() {
  // const { user } = await validateRequest()

  // if (!user) {
  //     return Response.json({ error: "Unauthorized" }, { status: 401 })
  // }

  // TODO: Fetch user farm's GREEN_INVOICE_ID & SECRET

  try {
    const res = await fetch(`${process.env.MORNING_PROD_URL}/account/token`, {
      cache: 'no-store',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: process.env.GREEN_INVOICE_ID,
        secret: process.env.GREEN_INVOICE_SECRET,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch token')
    }
    return data.token
  } catch (error) {
    console.error('Token fetch error:', error)
    throw new Error('Failed to fetch token')
  }
}

export async function morningApi(endpoint: string, options: any) {
  try {
    const TOKEN = await token()
    const res = await fetch(`${process.env.MORNING_PROD_URL}${endpoint}`, {
      method: options.method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    const data = await res.json()
    return { data, ok: res.ok }
  } catch (error) {
    console.error('API fetch error:', error)
    throw new Error('Failed to fetch from morningApi')
  }
}

export async function document(
  pallets: number,
  clientName: string,
  income: any
) {
  const clientFetch = await morningApi('/clients/search', {
    method: 'POST',
    body: {
      pageSize: 500,
    },
  })
  const clientData = clientFetch.data.items.find(
    (client: any) => client.name === clientName
  )

  if (!clientData) {
    console.log(`Client with name ${clientName} not found`)
    return
  }

  const morningSlip = {
    description: `משטחי ט"ש - ${pallets}`,
    type: 200,
    lang: 'he',
    currency: 'ILS',
    vatType: 0,
    client: clientData,
    income: income,
  }

  const res = await morningApi('/documents', {
    method: 'POST',
    body: morningSlip,
  })

  if (res.ok) console.log('Successfully created shipping slip (morning)')

  const data = await res.data
  const todayDate = new Date().toString().split('T')[0]
  const returnedDocument = {
    id: data.id,
    number: data.number,
    date: todayDate,
    type: data.type,
    url: data.url.origin,
  }

  return returnedDocument
}
