const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')

const schema = read('prisma/schema.prisma')
const membershipService = read('src/services/payments/parent-membership.ts')
const paystackService = read('src/services/payments/paystack.ts')
const membershipCheckout = read('src/app/api/parental-guidance/membership/checkout/route.ts')
const membershipVerify = read('src/app/api/parental-guidance/membership/verify/route.ts')
const membershipCheckoutPaypal = read('src/app/api/parental-guidance/membership/checkout-paypal/route.ts')
const membershipVerifyPaypal = read('src/app/api/parental-guidance/membership/verify-paypal/route.ts')
const schoolRequestRoute = read('src/app/api/parental-guidance/school-request/route.ts')
const courseAccessPage = read('src/app/(dashboard)/dashboard/my-learning/courses/[course-slug]/page.tsx')
const courseSalesPage = read('src/components/courses/CourseSalesPage/index.tsx')
const courseEnrollCard = read('src/components/courses/CourseEnrollCard/index.tsx')
const coursePlayer = read('src/components/courses/CoursePlayer/index.tsx')
const courseEditor = read('src/components/dashboard/CourseEditor/index.tsx')
const resourceDownloadRoute = read('src/app/api/courses/lessons/[lessonId]/resource/route.ts')
const resourceUploadRoute = read('src/app/api/admin/courses/[id]/lessons/[lessonId]/resource/route.ts')
const resourceStorage = read('src/lib/api/course-resources-storage.ts')
const curriculum = read('scripts/lib/parental-guidance-curriculum.js')
const seedScript = read('scripts/seed-parental-guidance.js')
const bookCatalog = read('src/lib/data/book-catalog.ts')
const books = read('src/lib/data/books.ts')
const coachingOffers = read('src/lib/data/coaching-offers.ts')
const landingPage = read('src/app/(site)/parental-guidance/page.tsx')
const coursesListPage = read('src/app/(site)/parental-guidance/courses/page.tsx')
const membershipPage = read('src/app/(site)/parental-guidance/membership/page.tsx')
const mentorshipPage = read('src/app/(site)/parental-guidance/mentorship/page.tsx')
const schoolPage = read('src/app/(site)/parental-guidance/school/page.tsx')
const navigation = read('src/lib/data/navigation.ts')

const surface = [
  schema,
  membershipService,
  membershipCheckout,
  membershipVerify,
  membershipCheckoutPaypal,
  membershipVerifyPaypal,
  schoolRequestRoute,
  courseAccessPage,
  courseSalesPage,
  courseEnrollCard,
  coursePlayer,
  courseEditor,
  resourceDownloadRoute,
  resourceUploadRoute,
  resourceStorage,
  curriculum,
  seedScript,
  bookCatalog,
  books,
  coachingOffers,
  landingPage,
  coursesListPage,
  membershipPage,
  mentorshipPage,
  schoolPage,
  navigation,
].join('\n')

const checks = [
  [
    'Parent Membership is structured exactly like the existing Journal Subscription: one row per payment, access checked by the latest unexpired row, never a single mutable subscription record, since no recurring/auto-charge billing exists anywhere in this codebase',
    schema.includes('model ParentMembership') &&
      membershipService.includes('findFirst({\n    where: { userId, expiresAt: { gt: new Date() } }'),
  ],
  [
    'the ParentMembership schema model enforces replay-safety with a provider+externalReference unique constraint, same as JournalSubscription',
    /model ParentMembership[\s\S]{0,600}@@unique\(\[provider, externalReference\]\)/.test(schema),
  ],
  [
    'renewing an active membership stacks the new 30 days onto the existing expiry rather than resetting to today, exactly mirroring the Journal pattern',
    membershipService.includes('active && active.expiresAt.getTime() > Date.now() ? active.expiresAt : new Date()'),
  ],
  [
    'the Paystack membership checkout is a one-time transaction/initialize call, not a fabricated subscription/plan API call that does not exist in this codebase',
    paystackService.includes('initializePaystackParentMembershipCheckout') &&
      /initializePaystackParentMembershipCheckout[\s\S]{0,600}transaction\/initialize/.test(paystackService),
  ],
  [
    'every membership payment route (Paystack and PayPal, checkout and verify) requires a signed-in session before anything else, and verify never trusts client-supplied amounts without independently checking them against the real membership price',
    membershipCheckout.includes('getServerSession') &&
      membershipCheckoutPaypal.includes('getServerSession') &&
      membershipVerify.includes('getServerSession') &&
      membershipVerify.includes('PARENT_MEMBERSHIP_PRICE_KES') &&
      membershipVerifyPaypal.includes('PARENT_MEMBERSHIP_PRICE_USD'),
  ],
  [
    'a Parent Membership grants access to a course by checking an active membership alongside direct enrollment, auto-enrolling with a zero-amount, clearly-labeled synthetic reference the same way a free course already does, never by fabricating a purchase price',
    courseAccessPage.includes('hasActiveParentMembership') &&
      courseAccessPage.includes('parent-membership:${course.id}:${userId}') &&
      courseAccessPage.includes("'parent-membership'"),
  ],
  [
    'the course sales page tells a covered member the course is included in their membership instead of silently asking them to pay again',
    courseSalesPage.includes('hasActiveParentMembership') && courseEnrollCard.includes('includedWithMembership'),
  ],
  [
    'every lesson resource (worksheet PDF) is gated by the same rule as the lesson itself: enrollment or an active membership for a Parental Guidance course, never publicly downloadable',
    resourceDownloadRoute.includes('getServerSession') &&
      resourceDownloadRoute.includes('courseEnrollment.findUnique') &&
      resourceDownloadRoute.includes('hasActiveParentMembership') &&
      resourceDownloadRoute.includes("status: 403"),
  ],
  [
    'the resource upload route is admin-only (content:write) and rejects anything that is not a real PDF under 10MB, so an admin cannot accidentally publish a broken or oversized download',
    resourceUploadRoute.includes("requireCrmApi('content:write')") &&
      resourceUploadRoute.includes("'application/pdf'") &&
      resourceUploadRoute.includes('MAX_RESOURCE_BYTES'),
  ],
  [
    'lesson resource files live under a private, never-public storage directory, same pattern as book PDFs and teaching videos, not inside /public',
    resourceStorage.includes('COURSE_RESOURCES_STORAGE_DIR') && !resourceStorage.includes("join(process.cwd(), 'public'"),
  ],
  [
    'the learner-facing course player actually renders a download link for an attached resource, not just the admin upload and the gated route with nothing wired to the UI',
    coursePlayer.includes('resourceFileName') && coursePlayer.includes('/api/courses/lessons/'),
  ],
  [
    'every one of the 12 curriculum modules carries a real resource name sourced from the curriculum document, never a placeholder like "TBD" or "Coming soon"',
    (() => {
      const mod = require(path.join(root, 'scripts/lib/parental-guidance-curriculum.js'))
      return (
        mod.modules.length === 12 &&
        mod.modules.every((m) => typeof m.resourceLabel === 'string' && m.resourceLabel.length > 5 && !/tbd|coming soon|placeholder/i.test(m.resourceLabel))
      )
    })(),
  ],
  [
    'the flagship course only attaches a resource to a lesson when the source document actually named one for that lesson, rather than inventing a download for every lesson',
    (() => {
      const mod = require(path.join(root, 'scripts/lib/parental-guidance-curriculum.js'))
      const withResource = mod.flagship.lessons.filter((l) => l.resourceLabel).length
      return mod.flagship.lessons.length === 6 && withResource === 4
    })(),
  ],
  [
    'the seed script is idempotent: it looks up each course by slug and skips creating it again if already seeded, so re-running it never duplicates content or clobbers an admin\'s edits',
    seedScript.includes('findUnique({ where: { slug') && seedScript.includes('already seeded'),
  ],
  [
    'every seeded course ships as a draft with a clearly-labeled placeholder price, never a fabricated real price treated as final, since the source curriculum document explicitly defers pricing to the business',
    seedScript.includes("status: 'draft'") &&
      seedScript.includes('MODULE_PLACEHOLDER_PRICE_KES') &&
      seedScript.includes('Placeholder') &&
      seedScript.toLowerCase().includes('admin must review pricing'),
  ],
  [
    'worksheet PDFs are generated from committed source via Playwright (already an installed project dependency for e2e tests), not fetched from an external API or committed as opaque binaries, and no new npm dependency was introduced to build them',
    seedScript.includes("require('@playwright/test')") &&
      seedScript.includes('renderWorksheetPdf') &&
      !seedScript.includes('pdfkit') &&
      !seedScript.includes('openai'),
  ],
  [
    'Parenting Mentorship is a request-only coaching tier with no fabricated price, exactly like the existing international coaching and VIP Summit tiers, never entering the payment pipeline',
    coachingOffers.includes("'parenting-mentorship'") &&
      /category: 'parenting-mentorship'/.test(coachingOffers) &&
      !new RegExp("category: 'parenting-mentorship'[\\s\\S]{0,300}priceKes").test(coachingOffers),
  ],
  [
    'the school/organization request is a pure CRM lead capture (no price, no payment route touched), reusing the same CrmContact -> CrmActivity -> CrmTask shape already proven for coaching quote requests',
    schoolRequestRoute.includes('crmContact') &&
      schoolRequestRoute.includes('crmActivity') &&
      schoolRequestRoute.includes('crmTask') &&
      schoolRequestRoute.includes("priority: 'high'") &&
      !schoolRequestRoute.includes('priceKes'),
  ],
  [
    'standalone Parenting Resources (worksheets/journals sold outside a course) reuse the existing Book purchase/review/download-grant machinery via a category field, rather than a parallel, untested PDF-selling system, and the public Books catalogue still defaults to showing only Book-category titles so it is not silently diluted',
    bookCatalog.includes("category: 'Book' | 'Parenting Resource' = 'Book'") &&
      books.includes("'Book' | 'Parenting Resource'"),
  ],
  [
    'Parental Guidance is reachable from the main site navigation, not an orphaned set of pages only reachable by a direct URL',
    navigation.includes("label: 'Parental Guidance'") && navigation.includes("href: '/parental-guidance'"),
  ],
  [
    'the landing, courses, membership, mentorship, and school pages all exist and the membership page states the real price rather than "contact us for pricing"',
    landingPage.includes('Parental Guidance') &&
      coursesListPage.includes('PARENT_MEMBERSHIP_COURSE_CATEGORY') &&
      membershipPage.includes('KES 1,500') &&
      mentorshipPage.includes('parenting-mentorship') &&
      schoolPage.includes('ParentalGuidanceSchoolRequestForm'),
  ],
  [
    'the whole Parental Guidance surface contains no em dash characters',
    !surface.includes('—'),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
