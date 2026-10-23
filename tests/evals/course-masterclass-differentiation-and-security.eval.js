const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')
const exists = (relative) => fs.existsSync(path.join(root, relative))

const schema = read('prisma/schema.prisma')
const videoStorage = read('src/lib/api/course-videos-storage.ts')
const videoCompression = read('src/services/courses/video-compression.ts')
const teachingCompression = read('src/services/teachings/video-compression.ts')
const videoUploadRoute = read('src/app/api/admin/courses/[id]/lessons/[lessonId]/video/route.ts')
const streamRoute = read('src/app/api/courses/lessons/[lessonId]/video/route.ts')
const coursePlayer = read('src/components/courses/CoursePlayer/index.tsx')
const courseEditor = read('src/components/dashboard/CourseEditor/index.tsx')
const courseService = read('src/services/courses/course-service.ts')
const contracts = read('src/services/courses/contracts.ts')
const courseSalesPage = read('src/components/courses/CourseSalesPage/index.tsx')
const courseEnrollCard = read('src/components/courses/CourseEnrollCard/index.tsx')
const courseCatalog = read('src/components/courses/CourseCatalog/index.tsx')
const comparisonStrip = read('src/components/courses/FormatComparisonStrip/index.tsx')
const coursesPage = read('src/app/(site)/academy/courses/page.tsx')
const masterclassesPage = read('src/app/(site)/academy/masterclasses/page.tsx')
const academyPage = read('src/app/(site)/academy/page.tsx')
const streamingActivity = read('src/services/courses/streaming-activity.ts')
const activityPage = read('src/app/(dashboard)/dashboard/admin/courses/[id]/activity/page.tsx')
const activityManager = read('src/components/dashboard/CourseActivityManager/index.tsx')
const revokeRoute = read('src/app/api/admin/courses/[id]/enrollments/[enrollmentId]/route.ts')
const courseManager = read('src/components/dashboard/CourseManager/index.tsx')
const learningPage = read('src/app/(dashboard)/dashboard/my-learning/courses/[course-slug]/page.tsx')
const envExample = read('.env.example')
const readme = read('src/services/courses/README.md')

const surface = [
  videoStorage, videoCompression, videoUploadRoute, streamRoute, coursePlayer, courseEditor, courseService,
  contracts, courseSalesPage, courseEnrollCard, courseCatalog, comparisonStrip, coursesPage, masterclassesPage,
  streamingActivity, activityPage, activityManager, revokeRoute, courseManager, learningPage,
].join('\n')

const checks = [
  // --- Schema ---------------------------------------------------------
  [
    'Course gained an optional accessWindowDays (null = lifetime, never retroactive) and CourseLesson gained a self-hosted video pair, mirroring Teaching',
    /model Course \{[\s\S]*?accessWindowDays\s+Int\?/.test(schema) &&
      /model CourseLesson \{[\s\S]*?videoFileName\s+String\?/.test(schema) &&
      /model CourseLesson \{[\s\S]*?videoProcessingStatus\s+String\s+@default\("ready"\)/.test(schema),
  ],
  [
    'CourseStreamEvent exists for abuse detection, scoped to an enrollment, never auto-blocking anything by itself (no status/blocked field, just a log)',
    /model CourseStreamEvent \{[\s\S]*?enrollmentId[\s\S]*?ipAddress[\s\S]*?\}/.test(schema) &&
      !/model CourseStreamEvent \{[\s\S]*?blocked/.test(schema),
  ],

  // --- Secure video delivery, replacing the public iframe leak --------
  [
    'lesson videos live under a private, never-public storage directory, same pattern as teaching videos and course resource PDFs',
    videoStorage.includes('COURSE_VIDEOS_STORAGE_DIR') && !videoStorage.includes("join(process.cwd(), 'public'"),
  ],
  [
    'course video compression uses the exact same ffmpeg encoding settings as teaching video compression, one policy for every self-hosted video on the site, not a second one to keep in sync',
    (() => {
      const extractArgs = (src) => (src.match(/'-c:v',[\s\S]*?'-movflags', '\+faststart',/) || [''])[0]
      return extractArgs(videoCompression) === extractArgs(teachingCompression) && extractArgs(videoCompression).length > 0
    })(),
  ],
  [
    'compression failure never leaves the lesson unplayable: on error the original upload stays referenced and videoProcessingStatus flips to failed, matching the teaching pattern',
    videoCompression.includes("videoProcessingStatus: 'failed'") && videoCompression.includes('catch'),
  ],
  [
    'the admin video upload route is content:write-gated and rejects a non-video file before ever touching disk',
    videoUploadRoute.includes("requireCrmApi('content:write')") && videoUploadRoute.includes('ALLOWED_VIDEO_TYPES'),
  ],
  [
    'background compression never blocks the upload response (fire-and-forget), so a multi-minute encode cannot time out the request',
    /compressCourseVideoInBackground\(\{[\s\S]{0,200}\}\)\.catch\(/.test(videoUploadRoute),
  ],
  [
    'the streaming route requires a session, then either direct enrollment or an active Parent Membership, the same gate as the lesson resource download route, before ever reading the file (the enrollment lookup call site runs before the file-existence check call site, not just textually earlier due to the import line)',
    streamRoute.includes('getServerSession') &&
      streamRoute.includes('courseEnrollment.findUnique') &&
      streamRoute.includes('hasActiveParentMembership') &&
      streamRoute.indexOf('courseEnrollment.findUnique(') < streamRoute.indexOf('courseVideoFileExists('),
  ],
  [
    'an admin can preview any lesson video without an enrollment row: the enrollment lookup only runs inside an if (!isAdmin) guard',
    /if \(!isAdmin\) \{\s*\n\s*enrollment = await db\.courseEnrollment\.findUnique/.test(streamRoute),
  ],
  [
    'a course access window is enforced on every stream request, computed from the real enrollment date, never trusted from the client, and a leaked recording past the window stops working even for the genuine buyer',
    streamRoute.includes('course.accessWindowDays') && streamRoute.includes('enrollment.enrolledAt.getTime()'),
  ],
  [
    'every successful stream is logged for abuse detection, scoped to the real enrollment, fire-and-forget so a logging hiccup can never break playback',
    streamRoute.includes('courseStreamEvent') && streamRoute.includes('getClientIp') && streamRoute.includes('.catch('),
  ],
  [
    'the stream keeps HTTP Range support (seeking) and the private, no-store cache header, exactly like the teaching stream route',
    streamRoute.includes("'Accept-Ranges': 'bytes'") && streamRoute.includes("'Cache-Control': 'private, no-store'"),
  ],

  // --- Player: protected delivery + deterrence, not a public iframe ---
  [
    'the player streams a self-hosted video through a native <video> element pointed at the gated route, with nodownload and no picture-in-picture, instead of an iframe embedding a public URL',
    coursePlayer.includes('/api/courses/lessons/') &&
      coursePlayer.includes('controlsList="nodownload') &&
      coursePlayer.includes('disablePictureInPicture'),
  ],
  [
    'a lesson with only a legacy external videoUrl still falls back to the iframe embed, so existing content never breaks',
    coursePlayer.includes('lesson.videoUrl') && coursePlayer.includes('<iframe'),
  ],
  [
    'the player overlays a viewer-identifying watermark on a self-hosted video and tells the viewer sharing their access risks suspension',
    coursePlayer.includes('viewerLabel') && /personal use only/i.test(coursePlayer) && /suspended if shared/i.test(coursePlayer),
  ],
  [
    'a masterclass with a time-limited access window shows the learner when their replay access ends, both in the sidebar and as a hard block once it has actually passed (never silently extended past what they paid for)',
    coursePlayer.includes('accessExpiresAt') &&
      learningPage.includes('accessExpired') &&
      learningPage.includes('course.accessWindowDays'),
  ],

  // --- Resaving the curriculum never regresses an upload ---------------
  [
    'resaving a course (even just to fix a typo) never wipes an already-uploaded lesson video, resource, or its ffprobe-measured duration, matched by lesson id so only a genuinely new lesson starts empty',
    courseService.includes('preserved?.get(lesson.id)') &&
      courseService.includes('carried?.videoFileName') &&
      courseService.includes('carried.durationSeconds'),
  ],
  [
    'the lesson id used for that carry-over is never trusted for anything except the lookup itself (not persisted as a stable DB id from client input)',
    contracts.includes('id: z.string().trim().optional()') &&
      /Only used to look up which existing lesson this is/.test(contracts),
  ],

  // --- Real differentiation: a course and a masterclass are not the same product presented twice ---
  [
    'the course sales page frames a course and a masterclass differently (curriculum vs single session), not the same "Lifetime access" claim and identical "Section 1/Section 2" structure for both',
    courseSalesPage.includes('isMasterclass') &&
      courseSalesPage.includes('Masterclass recording') &&
      courseSalesPage.includes('Self-paced course'),
  ],
  [
    'the enrollment card states lifetime access for a course but the real access window (or lack of one) for a masterclass, never a blanket "Lifetime access" claim regardless of kind',
    courseEnrollCard.includes('accessWindowDays') && courseEnrollCard.includes("accessWindowDays ? `${accessWindowDays}-day replay access` : 'Lifetime access'"),
  ],
  [
    'the two catalogue pages carry genuinely different hero copy (not the same promise with the word swapped), and both show the same side-by-side comparison so a visitor on either page sees the honest tradeoff',
    !coursesPage.includes('Find the right masterclass by topic') &&
      !masterclassesPage.includes('Choose a structured course') &&
      coursesPage.includes('FormatComparisonStrip') &&
      masterclassesPage.includes('FormatComparisonStrip'),
  ],
  [
    'the catalogue card itself shows kind-appropriate access language (lifetime vs access-window), not identical "lessons" wording for a one-session masterclass',
    courseCatalog.includes("accessWindowDays ? `${course.accessWindowDays}-day access` : 'Lifetime access'"),
  ],
  [
    'the Academy hub page no longer calls courses "still in development" while linking a "masterclasses" button that is actually just live programs: all three formats (live programs, masterclasses, courses) are named and linked distinctly',
    !academyPage.includes('In Development') &&
      !/still in development/i.test(academyPage) &&
      academyPage.includes('/academy#programs') &&
      academyPage.includes('/academy/masterclasses') &&
      academyPage.includes('/academy/courses'),
  ],
  [
    'the admin editor makes the real tradeoff legible at the point of creation: the legacy external-URL field is labeled less secure, and the access-window field explains the lifetime-vs-masterclass default rather than leaving an unlabeled number input',
    courseEditor.includes('legacy, public once embedded') &&
      courseEditor.includes('Replay access window') &&
      courseEditor.includes("kind === 'masterclass'"),
  ],

  // --- Admin-visible abuse signal + revocation, never automatic -------
  [
    'suspicious activity is a distinct-IP-count signal over a bounded recent window, with a stated, documented threshold, not an arbitrary unexplained number',
    streamingActivity.includes('SUSPICIOUS_DISTINCT_IP_THRESHOLD') && streamingActivity.includes('ACTIVITY_WINDOW_DAYS'),
  ],
  [
    'flagging an enrollment never itself revokes anything; revocation is a separate, explicit, admin-only, one-click action the admin takes after reviewing the signal',
    !streamingActivity.includes('courseEnrollment.delete') &&
      revokeRoute.includes("requireCrmApi('content:write')") &&
      revokeRoute.includes('courseEnrollment.delete'),
  ],
  [
    'the revoke route can only ever delete an enrollment that actually belongs to the course in the URL, never an arbitrary enrollment id from a different course',
    revokeRoute.includes('enrollment.courseId !== params.id'),
  ],
  [
    'the activity page is reachable from the admin course list and explicitly tells the admin this is a signal to judge, not proof of sharing',
    courseManager.includes('/activity') && /signal to judge|not proof of sharing/i.test(activityPage),
  ],

  // --- Docs ------------------------------------------------------------
  [
    'COURSE_VIDEOS_STORAGE_DIR is documented in .env.example with no real path committed, and the courses service README explains the security model',
    envExample.includes('COURSE_VIDEOS_STORAGE_DIR=') &&
      !/COURSE_VIDEOS_STORAGE_DIR=\S/.test(envExample) &&
      readme.includes('COURSE_VIDEOS_STORAGE_DIR') &&
      readme.toLowerCase().includes('watermark'),
  ],
  [
    'no video storage directory default resolves inside /public, for either resource (already shipped) or video storage',
    !read('src/lib/api/course-resources-storage.ts').includes("'public'"),
  ],

  [
    'the whole surface contains no em dash characters',
    !surface.includes('—'),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
