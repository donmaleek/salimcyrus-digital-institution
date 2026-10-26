import { generateImage as generateOpenAiImage } from '@/lib/api/openai-images'
import { generateFreeImage, type GeneratedImage } from '@/lib/api/free-image-generation'

/**
 * Admin-triggered image generation. The free model is the default and needs
 * no credential. OpenAI is opt-in only (IMAGE_GENERATION_PROVIDER=openai plus
 * OPENAI_API_KEY), so a stray or out-of-credit key can never take over, and
 * if OpenAI is selected but fails (no credits, rate limit) the free model
 * still produces the image.
 */
export async function generateCategoryImage(prompt: string): Promise<GeneratedImage & { provider: 'openai' | 'free' }> {
  const openAiKey = process.env.OPENAI_API_KEY
  if (process.env.IMAGE_GENERATION_PROVIDER === 'openai' && openAiKey) {
    try {
      const buffer = await generateOpenAiImage({ prompt, apiKey: openAiKey })
      return { buffer, extension: 'png', provider: 'openai' }
    } catch (error) {
      console.error('OpenAI image generation failed, falling back to the free model', {
        error: error instanceof Error ? error.message : error,
      })
    }
  }
  const image = await generateFreeImage({ prompt })
  return { ...image, provider: 'free' }
}
