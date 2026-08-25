import { decodeJournalImage, JOURNAL_IMAGE_MAX_BYTES } from '@/lib/journal/image'

describe('journal cover image validation', () => {
  it('decodes a supported image and normalizes its metadata', () => {
    const result = decodeJournalImage({
      dataUrl: 'data:image/png;base64,aGVsbG8=',
      alt: '  Salim speaking to an audience  ',
      caption: '  Leadership gathering  ',
    })

    expect(result.coverImageMime).toBe('image/png')
    expect(result.coverImageData.toString()).toBe('hello')
    expect(result.coverImageAlt).toBe('Salim speaking to an audience')
    expect(result.coverImageCaption).toBe('Leadership gathering')
  })

  it.each(['image/svg+xml', 'text/html', 'application/pdf'])('rejects %s uploads', (mime) => {
    expect(() => decodeJournalImage({ dataUrl: `data:${mime};base64,aGVsbG8=`, alt: 'A cover image' })).toThrow('JPG, PNG, or WebP')
  })

  it('rejects images beyond the database upload limit', () => {
    const oversized = Buffer.alloc(JOURNAL_IMAGE_MAX_BYTES + 1).toString('base64')
    expect(() => decodeJournalImage({ dataUrl: `data:image/jpeg;base64,${oversized}`, alt: 'A cover image' })).toThrow('smaller than 4 MB')
  })

  it('requires accessible alternative text', () => {
    expect(() => decodeJournalImage({ dataUrl: 'data:image/webp;base64,aGVsbG8=', alt: ' ' })).toThrow('Image description')
  })
})
