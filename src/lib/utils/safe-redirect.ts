/**
 * A callbackUrl round-trips through query strings and user-controlled
 * request flow (register -> login -> destination), so it must never be
 * followed blindly — an attacker could set callbackUrl to an external
 * origin and use this site's own login flow as an open redirect. Only a
 * same-site, root-relative path is safe.
 */
export function isSafeRedirectPath(path: string | null | undefined): path is string {
  if (!path) return false
  if (!path.startsWith('/')) return false
  if (path.startsWith('//')) return false // protocol-relative -> external origin
  if (path.startsWith('/\\')) return false
  return true
}

export function safeRedirectPath(path: string | null | undefined, fallback: string): string {
  return isSafeRedirectPath(path) ? path : fallback
}
