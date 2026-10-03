/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { middleware } from './middleware'
import { BYPASS_COOKIE_NAME } from './lib/suspension'

const originalEnv = { ...process.env }

function request(url: string, cookie?: string) {
  const headers = cookie ? { cookie } : undefined
  return new NextRequest(url, { headers })
}

describe('middleware (site suspension)', () => {
  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('passes every request through untouched when the site is not suspended', async () => {
    delete process.env.APP_SUSPENDED
    const response = await middleware(request('https://salimcyrus.com/anything'))
    expect(response.status).toBe(200)
  })

  it('returns a 503 unreachable-site page for an ordinary visitor once suspended', async () => {
    process.env.APP_SUSPENDED = 'true'
    process.env.SUSPENSION_BYPASS_TOKEN = 'the-real-secret'
    const response = await middleware(request('https://salimcyrus.com/anything'))
    expect(response.status).toBe(503)
    expect(response.headers.get('Retry-After')).toBeTruthy()
    const body = await response.text()
    expect(body).toContain('This site can no longer be reached.')
  })

  it('blocks API routes too, not just pages, since "off" means fully off', async () => {
    process.env.APP_SUSPENDED = 'true'
    process.env.SUSPENSION_BYPASS_TOKEN = 'the-real-secret'
    const response = await middleware(request('https://salimcyrus.com/api/books/checkout'))
    expect(response.status).toBe(503)
  })

  it('lets the request through and sets a bypass cookie when the correct token is in the query string', async () => {
    process.env.APP_SUSPENDED = 'true'
    process.env.SUSPENSION_BYPASS_TOKEN = 'the-real-secret'
    const response = await middleware(request('https://salimcyrus.com/dashboard?bypass=the-real-secret'))
    expect(response.status).toBe(200)
    const setCookie = response.cookies.get(BYPASS_COOKIE_NAME)
    expect(setCookie?.value).toBe('the-real-secret')
  })

  it('still returns 503 when the query token is wrong', async () => {
    process.env.APP_SUSPENDED = 'true'
    process.env.SUSPENSION_BYPASS_TOKEN = 'the-real-secret'
    const response = await middleware(request('https://salimcyrus.com/anything?bypass=guessed'))
    expect(response.status).toBe(503)
  })

  it('lets the request through on a later visit using the bypass cookie, with no query param needed', async () => {
    process.env.APP_SUSPENDED = 'true'
    process.env.SUSPENSION_BYPASS_TOKEN = 'the-real-secret'
    const response = await middleware(request('https://salimcyrus.com/anything', `${BYPASS_COOKIE_NAME}=the-real-secret`))
    expect(response.status).toBe(200)
  })

  it('still blocks a forged or stale bypass cookie that does not match the current secret', async () => {
    process.env.APP_SUSPENDED = 'true'
    process.env.SUSPENSION_BYPASS_TOKEN = 'the-real-secret'
    const response = await middleware(request('https://salimcyrus.com/anything', `${BYPASS_COOKIE_NAME}=an-old-or-forged-value`))
    expect(response.status).toBe(503)
  })
})
