export function formatCurrency(amount: number, currency = 'KES'): string {
  return `${currency} ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(amount)}`
}
