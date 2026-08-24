import { formatCurrency } from './currency'

describe('formatCurrency', () => {
  it('formats a whole KES amount with the currency code', () => {
    expect(formatCurrency(1499)).toBe('KES 1,499')
  })

  it('formats a USD amount when currency is overridden', () => {
    expect(formatCurrency(49, 'USD')).toBe('USD 49')
  })

  it('formats zero without throwing', () => {
    expect(formatCurrency(0)).toBe('KES 0')
  })

  it('formats large amounts with thousands separators', () => {
    expect(formatCurrency(1250000)).toBe('KES 1,250,000')
  })
})
