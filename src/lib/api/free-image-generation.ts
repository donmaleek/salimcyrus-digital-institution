/**
 * Free text-to-image generation through Pollinations (no account, no API
 * key, no cost), used for admin-triggered coaching category card art while
 * no paid image API is configured. Anonymous requests carry a small
 * "pollinations.ai" mark in the corner; setting POLLINATIONS_API_KEY (a free
 * key from their dashboard) uses their authenticated tier instead. Only the
 * admin-typed prompt leaves the server, never user data, and it is never
 * called from a public route.
 */
const POLLINATIONS_BASE = 'https://image.pollinations.ai/prompt'
const REQUEST_TIMEOUT_MS = 55_000
const MIN_IMAGE_BYTES = 2_000
const MAX_IMAGE_BYTES = 10 * 1024 * 1024

export interface GeneratedImage {
  buffer: Buffer
  extension: 'png' | 'jpg' | 'webp'
}

export function detectImageExtension(bytes: Buffer): GeneratedImage['extension'] | null {
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png'
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg'
  if (bytes.length >= 12 && bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP') return 'webp'
  return null
}

export async function generateFreeImage({
  prompt,
  fetcher = fetch,
  apiKey = process.env.POLLINATIONS_API_KEY,
  seed = Math.floor(Math.random() * 1_000_000),
}: {
  prompt: string
  fetcher?: typeof fetch
  apiKey?: string
  seed?: number
}): Promise<GeneratedImage> {
  const query = new URLSearchParams({
    width: '1024',
    height: '1024',
    model: 'flux',
    nologo: 'true',
    private: 'true',
    seed: String(seed),
  })
  const url = `${POLLINATIONS_BASE}/${encodeURIComponent(prompt)}?${query}`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const response = await fetcher(url, {
      signal: controller.signal,
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
    })
    if (!response.ok) {
      throw new Error(`Free image service responded ${response.status}`)
    }
    const buffer = Buffer.from(await response.arrayBuffer())
    if (buffer.length < MIN_IMAGE_BYTES || buffer.length > MAX_IMAGE_BYTES) {
      throw new Error('Free image service returned an unusable file size')
    }
    const extension = detectImageExtension(buffer)
    if (!extension) {
      throw new Error('Free image service did not return an image')
    }
    return { buffer, extension }
  } finally {
    clearTimeout(timer)
  }
}
