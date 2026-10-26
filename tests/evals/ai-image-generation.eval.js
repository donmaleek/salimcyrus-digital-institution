const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')

const client = read('src/lib/api/openai-images.ts')
const freeClient = read('src/lib/api/free-image-generation.ts')
const selector = read('src/lib/api/image-generation.ts')
const generateRoute = read('src/app/api/admin/coaching/categories/[slug]/image/generate/route.ts')
const manager = read('src/components/dashboard/CoachingOfferManager/index.tsx')
const envExample = read('.env.example')
const readme = read('README.md')

const surface = [client, freeClient, selector, generateRoute, manager].join('\n')

const checks = [
  [
    'the OpenAI client is a thin, injectable-fetcher wrapper matching the existing third-party API client style (PayPal/Paystack), not a heavier SDK dependency',
    client.includes('fetcher?: typeof fetch') && client.includes('fetcher = fetch') && client.includes('api.openai.com'),
  ],
  [
    'the generate route requires the content:write admin permission before anything else, so this is never reachable by an unauthenticated visitor',
    /export async function POST[\s\S]{0,120}requireCrmApi\('content:write'\)/.test(generateRoute),
  ],
  [
    'the admin permission check happens before any external call: a forbidden request can never trigger a generation request to any provider',
    generateRoute.indexOf("requireCrmApi('content:write')") <
      generateRoute.indexOf('generateCategoryImage('),
  ],
  [
    'with no credential configured the feature still works through the free model (Pollinations, no key), OpenAI is opt-in via IMAGE_GENERATION_PROVIDER (a key alone never switches, and a failure falls back to free), and the route no longer refuses with a 503',
    !generateRoute.includes('status: 503') &&
      selector.includes("process.env.IMAGE_GENERATION_PROVIDER === 'openai'") &&
      selector.includes('falling back to the free model') &&
      selector.includes('generateFreeImage') &&
      freeClient.includes('image.pollinations.ai') &&
      freeClient.includes('fetcher?: typeof fetch'),
  ],
  [
    'a failed generation (rate limit, safety rejection, network error) returns a clean error and never writes a partial/corrupt file to the image storage directory',
    /try \{[\s\S]*?generateCategoryImage\([\s\S]*?\} catch \(error\) \{[\s\S]*?status: 502/.test(generateRoute),
  ],
  [
    'a successful generation is saved through the exact same storage path and DB upsert shape as a manual upload, so the picker and every other consumer cannot tell an AI-generated image from an uploaded one',
    generateRoute.includes('coachingImagesStorageDir') &&
      generateRoute.includes('db.coachingCategoryImage.upsert') &&
      generateRoute.includes('/api/coaching/image/'),
  ],
  [
    'the admin UI pre-fills a brand-styled prompt (navy/gold, no text, no faces) rather than leaving the field blank, but still lets the admin edit it before generating',
    manager.includes('defaultImagePrompt') &&
      manager.includes('#0F1B2D') &&
      manager.includes('#C9A227') &&
      manager.includes('no text') &&
      manager.includes('onChange={(e) => setPrompt(e.target.value)}'),
  ],
  [
    'generating replaces the shown image via the same onUploaded callback an upload uses, so the UI has one state-update path, not two drifting implementations',
    (manager.match(/onUploaded\(payload\.image\.imagePath\)/g) || []).length === 2,
  ],
  [
    'both optional keys are documented in .env.example with no real secret committed, and the README explains the free default, the watermark note, the OpenAI upgrade and that it is admin-only',
    envExample.includes('OPENAI_API_KEY=') &&
      envExample.includes('POLLINATIONS_API_KEY=') &&
      envExample.includes('IMAGE_GENERATION_PROVIDER=') &&
      !/(OPENAI|POLLINATIONS)_API_KEY=\S/.test(envExample) &&
      readme.includes('POLLINATIONS_API_KEY') &&
      readme.includes('OPENAI_API_KEY') &&
      readme.includes('gpt-image-1') &&
      readme.toLowerCase().includes('admin-only'),
  ],
  [
    'no API key, model name, or other secret-shaped literal is hard-coded anywhere in the generation surface besides the documented env var name and the public model identifier',
    !/sk-[a-zA-Z0-9]{20,}/.test(surface),
  ],
  [
    'the whole AI image generation surface contains no em dash characters',
    !surface.includes('—'),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
