import { NextRequest, NextResponse } from 'next/server'
import {
  isAppSuspended,
  hasValidBypass,
  suspendedPageHtml,
  BYPASS_COOKIE_NAME,
  BYPASS_QUERY_PARAM,
  BYPASS_COOKIE_MAX_AGE_SECONDS,
} from '@/lib/suspension'

export function middleware(request: NextRequest) {
  if (!isAppSuspended(process.env)) {
    return NextResponse.next()
  }

  const expectedToken = process.env.SUSPENSION_BYPASS_TOKEN
  const queryToken = request.nextUrl.searchParams.get(BYPASS_QUERY_PARAM)
  const cookieToken = request.cookies.get(BYPASS_COOKIE_NAME)?.value

  if (hasValidBypass(queryToken, expectedToken)) {
    const response = NextResponse.next()
    response.cookies.set(BYPASS_COOKIE_NAME, expectedToken as string, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: BYPASS_COOKIE_MAX_AGE_SECONDS,
    })
    return response
  }

  if (hasValidBypass(cookieToken, expectedToken)) {
    return NextResponse.next()
  }

  return new NextResponse(suspendedPageHtml(), {
    status: 503,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Retry-After': '86400',
    },
  })
}
