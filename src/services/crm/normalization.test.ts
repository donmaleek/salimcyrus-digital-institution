import {
  contactDisplayName,
  normalizeEmail,
  normalizePhone,
  spreadsheetSafe,
} from './normalization'

describe('CRM normalization', () => {
  it('normalizes email without altering the retained source value', () => {
    expect(normalizeEmail('  Salim@Example.COM ')).toBe('salim@example.com')
    expect(normalizeEmail('')).toBeNull()
  })

  it('normalizes Kenyan local phone numbers for duplicate matching', () => {
    expect(normalizePhone('0712 345 678')).toBe('254712345678')
    expect(normalizePhone('+254 712 345 678')).toBe('254712345678')
  })

  it('builds readable names and protects spreadsheet exports', () => {
    expect(contactDisplayName('Salim', 'Cyrus')).toBe('Salim Cyrus')
    expect(spreadsheetSafe('=IMPORTXML("bad")')).toBe('\'=IMPORTXML("bad")')
    expect(spreadsheetSafe('Safe value')).toBe('Safe value')
  })
})
