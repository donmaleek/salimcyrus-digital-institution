import { detectImageExtension, generateFreeImage } from './free-image-generation'

const jpeg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(5000, 1)])
const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(5000, 1)])

function respond(body: Buffer | string, init: { status?: number } = {}) {
  const status = init.status ?? 200
  return jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    arrayBuffer: async () => {
      const bytes = typeof body === 'string' ? Buffer.from(body) : body
      return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
    },
  }) as unknown as typeof fetch
}

describe('detectImageExtension', () => {
  it('recognises png, jpeg and webp by magic bytes and rejects anything else', () => {
    expect(detectImageExtension(png)).toBe('png')
    expect(detectImageExtension(jpeg)).toBe('jpg')
    expect(detectImageExtension(Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBP'), Buffer.alloc(10)]))).toBe('webp')
    expect(detectImageExtension(Buffer.from('<html>rate limited</html>'))).toBeNull()
  })
})

describe('generateFreeImage', () => {
  it('requests a 1024 flux image with the prompt URL-encoded and returns the bytes with the detected type', async () => {
    const fetcher = respond(jpeg)
    const result = await generateFreeImage({ prompt: 'a gold compass & navy sky', fetcher, apiKey: '', seed: 5 })
    expect(result.extension).toBe('jpg')
    expect(result.buffer.length).toBe(jpeg.length)
    const [url, options] = (fetcher as jest.Mock).mock.calls[0]
    expect(url).toContain('/prompt/a%20gold%20compass%20%26%20navy%20sky?')
    expect(url).toContain('width=1024')
    expect(url).toContain('model=flux')
    expect(url).toContain('seed=5')
    expect(options.headers).toBeUndefined()
  })

  it('sends the optional free-tier key as a bearer token when one is configured', async () => {
    const fetcher = respond(png)
    await generateFreeImage({ prompt: 'a gold compass', fetcher, apiKey: 'free-key', seed: 1 })
    expect((fetcher as jest.Mock).mock.calls[0][1].headers).toEqual({ Authorization: 'Bearer free-key' })
  })

  it('throws when the service answers with an error status', async () => {
    await expect(generateFreeImage({ prompt: 'x y z', fetcher: respond('busy', { status: 429 }), apiKey: '' })).rejects.toThrow('429')
  })

  it('throws instead of saving an HTML error page or tiny body as an image', async () => {
    await expect(generateFreeImage({ prompt: 'x y z', fetcher: respond(Buffer.alloc(5000, 65)), apiKey: '' })).rejects.toThrow('did not return an image')
    await expect(generateFreeImage({ prompt: 'x y z', fetcher: respond('<html>'), apiKey: '' })).rejects.toThrow('unusable file size')
  })
})
