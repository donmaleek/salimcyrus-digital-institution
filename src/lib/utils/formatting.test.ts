import { formatDateTime, formatShortDate, toWholeNumberString } from './formatting'

describe('toWholeNumberString', () => {
  it('snaps decimals to the nearest whole number', () => {
    expect(toWholeNumberString('1500.7')).toBe('1501')
    expect(toWholeNumberString('45.5')).toBe('46')
    expect(toWholeNumberString('12.2')).toBe('12')
  })

  it('keeps whole numbers and an empty field as typed', () => {
    expect(toWholeNumberString('2500')).toBe('2500')
    expect(toWholeNumberString('')).toBe('')
  })

  it('treats a trailing decimal point mid-typing as the whole number', () => {
    expect(toWholeNumberString('1500.')).toBe('1500')
  })
})

describe('Nairobi date formatting (hydration-safe)', () => {
  // 21:30 UTC on 1 Mar is already 2 Mar in Nairobi (UTC+3). A server in UTC and
  // a browser in Nairobi used to disagree on this date, causing React error #418.
  const lateUtc = '2026-03-01T21:30:00.000Z'

  it('always renders the Nairobi calendar day, regardless of the host time zone', () => {
    expect(formatShortDate(lateUtc)).toBe('02/03/2026')
  })

  it('renders date and time in Nairobi time', () => {
    expect(formatDateTime(lateUtc, { hour: '2-digit', minute: '2-digit', hour12: false })).toContain('00:30')
  })
})
