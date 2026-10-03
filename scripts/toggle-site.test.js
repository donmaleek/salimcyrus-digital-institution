const { currentlySuspended, setSuspended } = require('./toggle-site')

describe('currentlySuspended', () => {
  it('is true only when the file has an exact APP_SUSPENDED=true line', () => {
    expect(currentlySuspended('APP_SUSPENDED=true\n')).toBe(true)
  })

  it('is false when the file has no such line at all', () => {
    expect(currentlySuspended('DATABASE_URL=postgres://...\n')).toBe(false)
  })

  it('is false when the line says false', () => {
    expect(currentlySuspended('APP_SUSPENDED=false\n')).toBe(false)
  })

  it('finds the line regardless of where it sits among other env vars', () => {
    expect(currentlySuspended('A=1\nAPP_SUSPENDED=true\nB=2\n')).toBe(true)
  })
})

describe('setSuspended', () => {
  it('appends a new line when the file has no APP_SUSPENDED entry yet', () => {
    const result = setSuspended('DATABASE_URL=postgres://...\n', true)
    expect(result).toBe('DATABASE_URL=postgres://...\nAPP_SUSPENDED=true\n')
  })

  it('adds a newline before appending if the file does not already end with one', () => {
    const result = setSuspended('DATABASE_URL=postgres://...', true)
    expect(result).toBe('DATABASE_URL=postgres://...\nAPP_SUSPENDED=true\n')
  })

  it('replaces an existing APP_SUSPENDED line in place, preserving every other line untouched', () => {
    const result = setSuspended('A=1\nAPP_SUSPENDED=false\nB=2\n', true)
    expect(result).toBe('A=1\nAPP_SUSPENDED=true\nB=2\n')
  })

  it('is idempotent: setting the same value twice produces the same single line, never a duplicate', () => {
    const once = setSuspended('A=1\n', true)
    const twice = setSuspended(once, true)
    expect(twice).toBe(once)
    expect(twice.match(/APP_SUSPENDED=/g)).toHaveLength(1)
  })

  it('handles an empty file', () => {
    expect(setSuspended('', false)).toBe('APP_SUSPENDED=false\n')
  })
})
