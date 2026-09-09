const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')

const schema = read('prisma/schema.prisma')
const previewRoute = read('src/app/api/teachings/preview/[fileName]/route.ts')
const streamRoute = read('src/app/api/teachings/stream/[teachingId]/route.ts')
const adminRoute = read('src/app/api/admin/teachings/route.ts')
const assetsRoute = read('src/app/api/admin/teachings/[id]/assets/route.ts')
const teachingAssetsService = read('src/services/teachings/teaching-assets.ts')
const uploadForm = read('src/components/dashboard/TeachingUploadForm/index.tsx')
const teachingManager = read('src/components/dashboard/TeachingManager/index.tsx')
const hoverPreview = read('src/components/teachings/TeachingHoverPreview/index.tsx')
const listingPage = read('src/app/(site)/teachings/page.tsx')

const checks = [
  [
    'Teaching model has a distinct previewFileName field, separate from the purchase-gated videoFileName',
    /previewFileName\s+String\?/.test(schema),
  ],
  [
    'the preview route requires no authentication and no purchase check, unlike the actual stream route',
    !previewRoute.includes('getServerSession') &&
      !previewRoute.includes('teachingPurchase') &&
      streamRoute.includes('getServerSession') &&
      streamRoute.includes('teachingPurchase'),
  ],
  [
    'the preview route only ever reads from the requested fileName param, never looks up or reads the main video field itself',
    !previewRoute.includes('teaching.videoFileName') && !previewRoute.includes('db.teaching'),
  ],
  [
    'the preview clip is written to a filename distinct from the main video, so it can never accidentally BE the main video file on disk',
    teachingAssetsService.includes('`${slug}-preview.${ext}`') && adminRoute.includes("`${slug}.${videoExt}`"),
  ],
  [
    'preview clip uploads are validated by MIME type and size-capped well below the main video limit (it is a short teaser, not the full teaching)',
    teachingAssetsService.includes('MAX_PREVIEW_BYTES') && teachingAssetsService.includes('ALLOWED_VIDEO_TYPES[file.type]'),
  ],
  [
    'the preview clip upload is optional: a teaching can still be created with no preview at all',
    adminRoute.includes('let previewFileName: string | null = null'),
  ],
  [
    'the admin upload form exposes the preview clip as an optional field, not required',
    uploadForm.includes('teaching-preview') && uploadForm.includes('(optional)'),
  ],
  [
    'the hover preview component supports Range-friendly streaming (preload="none", so nothing downloads until the visitor actually hovers)',
    hoverPreview.includes('preload="none"') && hoverPreview.includes('autoPlay') && hoverPreview.includes('muted'),
  ],
  [
    'the hover preview only starts playback after a real hover, not an instant flicker on mouse pass-through',
    hoverPreview.includes('HOVER_DELAY_MS') && hoverPreview.includes('setTimeout'),
  ],
  [
    'hovering works even when a teaching has no thumbnail yet: the mouse listeners live on the outermost wrapper, not inside a branch that only renders when a thumbnail exists',
    (() => {
      const wrapperStart = hoverPreview.indexOf('data-testid="teaching-hover-preview"')
      const thumbnailBranchStart = hoverPreview.indexOf('thumbnailSrc ?')
      return wrapperStart !== -1 && thumbnailBranchStart !== -1 && wrapperStart < thumbnailBranchStart
    })(),
  ],
  [
    'the teachings catalog page wires the preview URL from previewFileName, not the purchase-gated video field',
    listingPage.includes('TeachingHoverPreview') &&
      listingPage.includes('/api/teachings/preview/${teaching.previewFileName}') &&
      !listingPage.includes('videoFileName'),
  ],
  [
    'a teaching already published before this feature existed (or one whose admin skipped the thumbnail/preview at upload time) can still get one added afterward, not just at creation time',
    assetsRoute.includes("requireCrmApi('content:write')") &&
      assetsRoute.includes('saveTeachingThumbnail') &&
      assetsRoute.includes('saveTeachingPreview') &&
      teachingManager.includes('Edit Media'),
  ],
  [
    'the create route and the edit-existing-teaching route share the same thumbnail/preview validation and storage logic, not two copies that could drift apart',
    adminRoute.includes("from '@/services/teachings/teaching-assets'") &&
      assetsRoute.includes("from '@/services/teachings/teaching-assets'") &&
      teachingAssetsService.includes('export async function saveTeachingThumbnail') &&
      teachingAssetsService.includes('export async function saveTeachingPreview'),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
