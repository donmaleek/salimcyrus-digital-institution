import type { NextRequest } from 'next/server'

/**
 * Best-effort client IP from behind the nginx reverse proxy (see
 * README's deploy config: nginx proxies to the app on localhost). Used
 * only as an abuse-detection signal (see CourseStreamEvent), never for
 * access control itself, so a spoofed or missing header just weakens the
 * signal rather than breaking anything. X-Forwarded-For can carry a
 * client-appended chain ("client, proxy1, proxy2"); the first entry is
 * the original client.
 */
export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim()
    if (first) return first
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}
