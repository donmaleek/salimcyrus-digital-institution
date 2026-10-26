jest.mock('./openai-images', () => ({ generateImage: jest.fn() }))
jest.mock('./free-image-generation', () => ({ generateFreeImage: jest.fn() }))

import { generateCategoryImage } from './image-generation'
import { generateImage } from './openai-images'
import { generateFreeImage } from './free-image-generation'

const original = { key: process.env.OPENAI_API_KEY, provider: process.env.IMAGE_GENERATION_PROVIDER }
const free = { buffer: Buffer.from('j'), extension: 'jpg' }

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => undefined)
  ;(generateFreeImage as jest.Mock).mockResolvedValue(free)
})

afterEach(() => {
  process.env.OPENAI_API_KEY = original.key
  process.env.IMAGE_GENERATION_PROVIDER = original.provider
  jest.restoreAllMocks()
  jest.clearAllMocks()
})

describe('generateCategoryImage provider choice', () => {
  it('uses the free model by default, even when an OpenAI key is present', async () => {
    process.env.OPENAI_API_KEY = 'sk-test'
    delete process.env.IMAGE_GENERATION_PROVIDER
    const result = await generateCategoryImage('a compass')
    expect(result.provider).toBe('free')
    expect(generateImage).not.toHaveBeenCalled()
  })

  it('uses OpenAI only when explicitly selected and a key exists', async () => {
    process.env.OPENAI_API_KEY = 'sk-test'
    process.env.IMAGE_GENERATION_PROVIDER = 'openai'
    ;(generateImage as jest.Mock).mockResolvedValue(Buffer.from('p'))
    const result = await generateCategoryImage('a compass')
    expect(result).toMatchObject({ provider: 'openai', extension: 'png' })
    expect(generateFreeImage).not.toHaveBeenCalled()
  })

  it('stays on the free model when OpenAI is selected but no key is set', async () => {
    delete process.env.OPENAI_API_KEY
    process.env.IMAGE_GENERATION_PROVIDER = 'openai'
    expect((await generateCategoryImage('a compass')).provider).toBe('free')
    expect(generateImage).not.toHaveBeenCalled()
  })

  it('falls back to the free model when OpenAI fails, e.g. an account with no credits', async () => {
    process.env.OPENAI_API_KEY = 'sk-test'
    process.env.IMAGE_GENERATION_PROVIDER = 'openai'
    ;(generateImage as jest.Mock).mockRejectedValue(new Error('You have no credits remaining'))
    const result = await generateCategoryImage('a compass')
    expect(result.provider).toBe('free')
    expect(generateFreeImage).toHaveBeenCalledTimes(1)
  })
})
