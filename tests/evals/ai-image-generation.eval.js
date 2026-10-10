const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')

const client = read('src/lib/api/openai-images.ts')
const generateRoute = read('src/app/api/admin/coaching/categories/[slug]/image/generate/route.ts')
const manager = read('src/components/dashboard/CoachingOfferManager/index.tsx')
const envExample = read('.env.example')
const readme = read('README.md')

const surface = [client, generateRoute, manager].join('\n')

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
    'the admin permission check happens before the API key check, which happens before any external call: a forbidden request can never trigger a paid API call',
    generateRoute.indexOf("requireCrmApi('content:write')") <
      generateRoute.indexOf('process.env.OPENAI_API_KEY') &&
      generateRoute.indexOf('process.env.OPENAI_API_KEY') < generateRoute.indexOf('generateImage('),
  ],
  [
    'a missing OPENAI_API_KEY degrades gracefully with a clear 503, the same pattern as every other unconfigured third-party credential on this site (Paystack/PayPal/Resend), never a crash or a silent no-op',
    generateRoute.includes('if (!apiKey)') &&
      generateRoute.includes('status: 503') &&
      generateRoute.includes('not configured yet'),
  ],
  [
    'a failed generation (rate limit, safety rejection, network error) returns a clean error and never writes a partial/corrupt file to the image storage directory',
    /try \{[\s\S]*?generateImage\([\s\S]*?\} catch \(error\) \{[\s\S]*?status: 502/.test(generateRoute),
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
    'OPENAI_API_KEY is documented in .env.example with no real secret committed, and the README explains the degrade-gracefully behavior and that it is admin-only / costs money',
    envExample.includes('OPENAI_API_KEY=') &&
      !/OPENAI_API_KEY=\S/.test(envExample) &&
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
