const RESEND_FROM_ADDRESS = 'Salim Cyrus <books@salimcyrus.com>'

export interface SendEmailResult {
  sent: boolean
  reason?: string
}

/**
 * Sends a transactional email via Resend's HTTP API. Returns { sent: false }
 * rather than throwing when RESEND_API_KEY isn't configured, or when the
 * send fails — callers (the payment webhook) must not let email delivery
 * block or fail the payment recording, since the buyer's primary path back
 * to their purchase is the Paystack redirect, not the email.
 */
export async function sendEmail({
  to,
  subject,
  html,
  fetcher = fetch,
}: {
  to: string
  subject: string
  html: string
  fetcher?: typeof fetch
}): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return { sent: false, reason: 'RESEND_API_KEY not configured' }
  }

  try {
    const response = await fetcher('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: RESEND_FROM_ADDRESS, to, subject, html }),
    })
    if (!response.ok) {
      return { sent: false, reason: `Resend responded with ${response.status}` }
    }
    return { sent: true }
  } catch (error) {
    return { sent: false, reason: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export function bookDownloadEmailHtml({
  bookTitle,
  downloadUrl,
  expiresAt,
}: {
  bookTitle: string
  downloadUrl: string
  expiresAt: Date
}): string {
  const expiryLabel = expiresAt.toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #0f1b2d;">
      <h1 style="font-size: 20px;">Your book is ready</h1>
      <p>Thank you for purchasing <strong>${bookTitle}</strong>.</p>
      <p>
        <a href="${downloadUrl}" style="display: inline-block; padding: 12px 24px; background: #d4af37; color: #0f1b2d; text-decoration: none; border-radius: 999px; font-weight: 600;">
          Download your book
        </a>
      </p>
      <p style="font-size: 14px; color: #4a5568;">
        This link works up to 5 times and expires on ${expiryLabel}. Keep this
        email so you can re-download if needed.
      </p>
    </div>
  `
}
