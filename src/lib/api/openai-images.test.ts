import { generateImage } from './openai-images'

function fakeFetcher(response: { ok: boolean; status?: number; body: unknown }) {
  return jest.fn().mockResolvedValue({
    ok: response.ok,
    status: response.status ?? (response.ok ? 200 : 400),
    json: async () => response.body,
  })
}

describe('generateImage', () => {
  it('posts the prompt, model, and size to the images/generations endpoint with bearer auth', async () => {
    const fetcher = fakeFetcher({ ok: true, body: { data: [{ b64_json: Buffer.from('fake png bytes').toString('base64') }] } })

    await generateImage({ prompt: 'a gold compass on navy', apiKey: 'sk-test-key', fetcher })

    expect(fetcher).toHaveBeenCalledWith(
      'https://api.openai.com/v1/images/generations',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer sk-test-key' }),
      })
    )
    const body = JSON.parse((fetcher.mock.calls[0][1] as { body: string }).body)
    expect(body).toEqual({ model: 'gpt-image-1', prompt: 'a gold compass on navy', size: '1024x1024', n: 1 })
  })

  it('defaults to a 1024x1024 square image but accepts an explicit size', async () => {
    const fetcher = fakeFetcher({ ok: true, body: { data: [{ b64_json: Buffer.from('x').toString('base64') }] } })
    await generateImage({ prompt: 'x', apiKey: 'k', size: '1536x1024', fetcher })
    const body = JSON.parse((fetcher.mock.calls[0][1] as { body: string }).body)
    expect(body.size).toBe('1536x1024')
  })

  it('decodes the returned base64 image into a real Buffer', async () => {
    const original = Buffer.from('this is not really a png but stands in for one')
    const fetcher = fakeFetcher({ ok: true, body: { data: [{ b64_json: original.toString('base64') }] } })

    const result = await generateImage({ prompt: 'x', apiKey: 'k', fetcher })

    expect(result.equals(original)).toBe(true)
  })

  it('throws with the API-provided error message when the request fails', async () => {
    const fetcher = fakeFetcher({ ok: false, body: { error: { message: 'Your request was rejected by the safety system.' } } })
    await expect(generateImage({ prompt: 'x', apiKey: 'k', fetcher })).rejects.toThrow(
      'Your request was rejected by the safety system.'
    )
  })

  it('throws a generic error when the failure response has no parseable body', async () => {
    const fetcher = jest.fn().mockResolvedValue({ ok: false, status: 500, json: async () => { throw new Error('not json') } })
    await expect(generateImage({ prompt: 'x', apiKey: 'k', fetcher })).rejects.toThrow('OpenAI image generation failed')
  })

  it('throws when the response is ok but carries no image data (defensive, should never happen against the real API)', async () => {
    const fetcher = fakeFetcher({ ok: true, body: { data: [] } })
    await expect(generateImage({ prompt: 'x', apiKey: 'k', fetcher })).rejects.toThrow('OpenAI did not return image data')
  })
})
