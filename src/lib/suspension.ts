/**
 * The whole-site kill switch: this app was built for a client, and the
 * developer (not the client) needs to be able to take it fully offline on
 * non-payment and bring it back once paid, without touching any client
 * data or deployed code. Controlled entirely by env vars on the server, so
 * the client has no way to see or flip it themselves.
 *
 * APP_SUSPENDED=true suspends the whole site for every visitor except one
 * who has the bypass secret (SUSPENSION_BYPASS_TOKEN), so the developer can
 * still verify the live app while it's suspended for everyone else.
 * Unset/anything else means live, which is the safe default: a missing or
 * misconfigured env var must never accidentally take a paying client's
 * site offline.
 */

export const BYPASS_COOKIE_NAME = 'app_bypass'
export const BYPASS_QUERY_PARAM = 'bypass'
export const BYPASS_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 days

export function isAppSuspended(env: Record<string, string | undefined>): boolean {
  return env.APP_SUSPENDED === 'true'
}

/**
 * Plain equality is fine here: the token is a 32-byte random secret with
 * nowhere an attacker can observe per-character timing (it's compared once
 * per request against a fixed server value, not used to brute-force a
 * shared resource), and this guards a maintenance bypass, not payment or
 * account data.
 */
export function hasValidBypass(providedToken: string | null | undefined, expectedToken: string | undefined): boolean {
  if (!expectedToken || !providedToken) return false
  return providedToken === expectedToken
}

export function suspendedPageHtml(): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>Temporarily Unavailable</title>
<style>
  body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0f1b2d; color: #f7f3e9; font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 24px; box-sizing: border-box; }
  h1 { font-size: 1.5rem; margin: 0 0 8px; }
  p { margin: 0; color: rgba(247,243,233,0.7); }
</style>
</head>
<body>
  <div>
    <h1>Temporarily Unavailable</h1>
    <p>This site is undergoing maintenance. Please check back soon.</p>
  </div>
</body>
</html>`
}
