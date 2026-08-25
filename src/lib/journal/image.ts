export const JOURNAL_IMAGE_MAX_BYTES = 4 * 1024 * 1024

const supportedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

export interface JournalImageInput {
  dataUrl: string
  alt: string
  caption?: string
}

export function decodeJournalImage(input: JournalImageInput) {
  const match = input.dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/)
  if (!match || !supportedMimeTypes.has(match[1])) {
    throw new Error('Use a JPG, PNG, or WebP image.')
  }

  const alt = input.alt.trim()
  if (alt.length < 3 || alt.length > 180) {
    throw new Error('Image description must be between 3 and 180 characters.')
  }

  const data = Buffer.from(match[2], 'base64')
  if (data.length === 0 || data.length > JOURNAL_IMAGE_MAX_BYTES) {
    throw new Error('Image must be smaller than 4 MB.')
  }

  return {
    coverImageData: data,
    coverImageMime: match[1],
    coverImageAlt: alt,
    coverImageCaption: input.caption?.trim().slice(0, 240) || null,
  }
}
