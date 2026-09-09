const MAX_PROFILE_IMAGE_BYTES = 2 * 1024 * 1024

const signatures: Record<string, (bytes: Uint8Array) => boolean> = {
  'image/jpeg': (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/png': (b) =>
    b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  'image/webp': (b) =>
    String.fromCharCode(...b.slice(0, 4)) === 'RIFF' &&
    String.fromCharCode(...b.slice(8, 12)) === 'WEBP',
}

export function validateProfileImage(mime: string, bytes: Uint8Array) {
  if (!signatures[mime]) return 'Use a JPG, PNG, or WebP image.'
  if (bytes.byteLength === 0) return 'Choose an image to upload.'
  if (bytes.byteLength > MAX_PROFILE_IMAGE_BYTES) return 'Your image must be 2 MB or smaller.'
  if (!signatures[mime](bytes)) return 'This file does not match its image format.'
  return null
}

export { MAX_PROFILE_IMAGE_BYTES }
