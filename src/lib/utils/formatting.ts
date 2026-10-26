export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })
}

// Business time zone, fixed so a server render and the browser's hydration
// always produce identical text (the server runs in UTC, browsers do not).
const BUSINESS_TIME_ZONE = 'Africa/Nairobi'

export function formatShortDate(value: string | number | Date): string {
  return new Date(value).toLocaleDateString('en-KE', { timeZone: BUSINESS_TIME_ZONE })
}

export function formatDateTime(
  value: string | number | Date,
  options: Intl.DateTimeFormatOptions = {}
): string {
  return new Date(value).toLocaleString('en-KE', { timeZone: BUSINESS_TIME_ZONE, ...options })
}

// For number inputs whose API field is a whole number (prices, page counts):
// snap a typed decimal to the nearest integer immediately so it can never
// reach server-side `.int()` validation.
export function toWholeNumberString(value: string): string {
  if (value === '') return ''
  const parsed = Number(value)
  return Number.isFinite(parsed) ? String(Math.round(parsed)) : value
}
