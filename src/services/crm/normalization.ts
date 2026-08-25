export function normalizeEmail(value?: string | null) {
  const normalized = value?.trim().toLowerCase()
  return normalized || null
}

export function normalizePhone(value?: string | null) {
  if (!value) return null
  const digits = value.replace(/\D/g, '')
  if (!digits) return null
  if (digits.startsWith('0') && digits.length === 10)
    return `254${digits.slice(1)}`
  if (digits.startsWith('254')) return digits
  return digits
}

export function contactDisplayName(
  firstName: string,
  lastName?: string | null
) {
  return [firstName.trim(), lastName?.trim()].filter(Boolean).join(' ')
}

export function spreadsheetSafe(value: string) {
  return /^[=+\-@]/.test(value) ? `'${value}` : value
}
