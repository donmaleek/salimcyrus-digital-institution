/**
 * OpenAI Images API (gpt-image-1), used only for admin-triggered content
 * generation (coaching category card art, at first), never called from a
 * public/unauthenticated route, since every call costs real money on the
 * account that owns OPENAI_API_KEY. gpt-image-1 always returns base64
 * image data directly (no hosted-url option like older DALL-E models), so
 * there is no second fetch needed to retrieve the bytes.
 */
const OPENAI_API_BASE = 'https://api.openai.com/v1'

export type OpenAiImageSize = '1024x1024' | '1024x1536' | '1536x1024'

export interface GenerateImageInput {
  prompt: string
  apiKey: string
  size?: OpenAiImageSize
  fetcher?: typeof fetch
}

export async function generateImage({
  prompt,
  apiKey,
  size = '1024x1024',
  fetcher = fetch,
}: GenerateImageInput): Promise<Buffer> {
  const response = await fetcher(`${OPENAI_API_BASE}/images/generations`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt,
      size,
      n: 1,
    }),
  })

  const data = await response.json().catch(() => null)
  if (!response.ok || !data) {
    const message = (data as { error?: { message?: string } } | null)?.error?.message
    throw new Error(message || 'OpenAI image generation failed')
  }

  const b64 = (data as { data?: Array<{ b64_json?: string }> }).data?.[0]?.b64_json
  if (!b64) {
    throw new Error('OpenAI did not return image data')
  }

  return Buffer.from(b64, 'base64')
}
