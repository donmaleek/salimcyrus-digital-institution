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

// Next 15.5+ buffers each request body that passes through middleware and
// truncates it at 10MB, which corrupts multi-gigabyte multipart video uploads
// ("Invalid form submission"). These two admin-only, session-gated upload
// endpoints are the only exclusions; every other path, API included, still
// goes through the suspension check.
export const config = {
  matcher: ['/((?!api/admin/courses/[^/]+/lessons/[^/]+/video$|api/admin/teachings$).*)'],
}
