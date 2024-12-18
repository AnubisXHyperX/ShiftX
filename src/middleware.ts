import { verifyRequestOrigin } from 'lucia'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// https://lucia-auth.com/guides/validate-session-cookies/nextjs-app

export async function middleware(request: NextRequest): Promise<NextResponse> {
  if (request.method === 'GET') {
    return NextResponse.next()
  }
  const originHeader = request.headers.get('Origin')
  // NOTE: You may need to use `X-Forwarded-Host` instead
  const hostHeader = request.headers.get('Host')
  if (
    !originHeader ||
    !hostHeader ||
    !verifyRequestOrigin(originHeader, [hostHeader])
  ) {
    return new NextResponse(null, {
      status: 403,
    })
  }
  return NextResponse.next()
}
