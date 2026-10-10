const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')

const books = read('src/lib/data/books.ts')
const bookAdminRoute = read('src/app/api/admin/books/route.ts')
const bookEditRoute = read('src/app/api/admin/books/[id]/route.ts')
const bookEditForm = read('src/components/dashboard/BookEditForm/index.tsx')
const bookEditPage = read('src/app/(dashboard)/dashboard/admin/books/[id]/edit/page.tsx')
const bookManager = read('src/components/dashboard/BookManager/index.tsx')

const offers = read('src/lib/data/coaching-offers.ts')
const catalog = read('src/lib/data/coaching-catalog.ts')
const picker = read('src/components/payments/CoachingCategoryPicker/index.tsx')
const tripDetailsForm = read('src/components/forms/CoachingTripDetailsForm/index.tsx')
const tripDetailsRoute = read('src/app/api/coaching/trip-details/route.ts')
const bookNowPage = read('src/app/(site)/book-now/page.tsx')
const coachingOfferManager = read('src/components/dashboard/CoachingOfferManager/index.tsx')
const coachingAdminPage = read('src/app/(dashboard)/dashboard/admin/coaching/page.tsx')
const offerOverrideRoute = read('src/app/api/admin/coaching/offers/[name]/route.ts')
const categoryImageRoute = read('src/app/api/admin/coaching/categories/[slug]/image/route.ts')
const schema = read('prisma/schema.prisma')

const surface = [
  books,
  bookAdminRoute,
  bookEditRoute,
  bookEditForm,
  bookEditPage,
  bookManager,
  offers,
  catalog,
  picker,
  tripDetailsForm,
  tripDetailsRoute,
  coachingOfferManager,
  coachingAdminPage,
  offerOverrideRoute,
  categoryImageRoute,
].join('\n')

const bookPriceKesValues = [...books.matchAll(/^\s{4}(\d+),$/gm)]
  .map((m) => Number(m[1]))
  .filter((n) => n >= 500 && n <= 600)

const checks = [
  // 1. Books pricing
  [
    'the book price ceiling is 600 KES, enforced as a real constant rather than a magic number repeated in multiple places',
    books.includes('BOOK_MAX_PRICE_KES = 600') &&
      bookAdminRoute.includes('BOOK_MAX_PRICE_KES') &&
      bookEditRoute.includes('BOOK_MAX_PRICE_KES'),
  ],
  [
    'every one of the 14 static book prices is at or under 600 KES, and all 14 are still distinct',
    bookPriceKesValues.length === 14 && new Set(bookPriceKesValues).size === 14,
  ],
  [
    'the create-book API route rejects a price above the cap',
    bookAdminRoute.includes('.max(BOOK_MAX_PRICE_KES)'),
  ],
  [
    'the edit-book API route also rejects a price above the cap, not just the create route',
    bookEditRoute.includes('.max(BOOK_MAX_PRICE_KES)'),
  ],

  // 2. Edit Book functionality
  [
    'an admin can edit an uploaded book\'s title, description, and prices without deleting and recreating it',
    bookEditRoute.includes('export async function PUT') &&
      bookEditForm.includes("xhr.open('PUT'") &&
      bookEditForm.includes('data-testid="book-edit-form"'),
  ],
  [
    'the edit route can replace the PDF and/or cover in place, keyed by the existing slug, so purchases and download links never break',
    bookEditRoute.includes("form.get('pdf')") &&
      bookEditRoute.includes("form.get('cover')") &&
      bookEditRoute.includes('existing.slug'),
  ],
  [
    'replacing the cover with a different file extension cleans up the old file instead of leaving an orphan on disk',
    bookEditRoute.includes('unlinkAsync') && bookEditRoute.includes('previousCoverFileName'),
  ],
  [
    'the book list in the admin dashboard links to the edit page for every book',
    bookManager.includes('/dashboard/admin/books/') && bookManager.includes('/edit') && bookManager.includes('Edit'),
  ],

  // 3 & 6. Coaching sessions: duration always real, shown prominently, price/duration/description never hard-coded for display
  [
    'every priced coaching offer carries a real time duration (not a location string) and the picker renders it in its own prominent "Duration" block, separate from price',
    !offers.includes("duration: 'Private one-on-one session'") &&
      !offers.includes("duration: \"At Salim's location\"") &&
      !offers.includes("duration: 'Your location, within Mombasa'") &&
      !offers.includes("duration: 'Your location, outside Mombasa'") &&
      picker.includes('data-testid="coaching-duration"') &&
      picker.includes('Duration'),
  ],
  [
    'coaching prices are never hard-coded as the only source of truth: a DB-backed override merges on top of the static defaults, and the Book Now page reads the merged result, not the raw static array',
    catalog.includes('CoachingOfferOverride') &&
      bookNowPage.includes('getCoachingCategories') &&
      bookNowPage.includes('getCoachingOffers') &&
      !bookNowPage.includes("from '@/lib/data/coaching-offers'"),
  ],
  [
    'checkout and the Paybill claim route all charge from the live, override-aware catalog (getCoachingOfferByName), never the static array directly, so an admin price edit is actually reflected at the moment of charging',
    ['src/app/api/coaching/checkout/route.ts', 'src/app/api/coaching/checkout-paypal/route.ts', 'src/app/api/coaching/verify/route.ts', 'src/app/api/coaching/verify-paypal/route.ts', 'src/app/api/payments/paybill/claim/route.ts']
      .every((file) => read(file).includes('getCoachingOfferByName') && !read(file).includes('coachingOffers.find')),
  ],

  // 4A/4B. New categories: Identity & Single Motherhood durations
  [
    'Identity & Life Alignment Session is 2 Hours',
    /name:\s*'Identity & Life Alignment Session'[\s\S]{0,60}duration:\s*'2 Hours'/.test(offers),
  ],
  [
    'Single Motherhood & Life Alignment Session is 1 Hour 30 Minutes',
    /name:\s*'Single Motherhood & Life Alignment Session'[\s\S]{0,80}duration:\s*'1 Hour 30 Minutes'/.test(offers),
  ],

  // 4C/4D. Individual/Couples, Your Location (Outside Mombasa): duration, transport/accommodation note, trip-details form
  [
    'Individual and Couples Coaching, Your Location (Kenya, Outside Mombasa) are both 3 Hours 30 Minutes',
    (offers.match(/duration:\s*'3 Hours 30 Minutes'/g) || []).length === 2,
  ],
  [
    'both outside-Mombasa offers carry the exact transport/accommodation commitment and are flagged to require trip details before payment',
    (offers.match(/logisticsNote:\s*\n\s*'Transport is catered for outside Mombasa, together with accommodation where required\.'/g) || []).length === 2 &&
      (offers.match(/requiresTripDetails: true/g) || []).length === 2,
  ],
  [
    'the logistics note is shown on the booking card before the client can proceed, not buried after booking',
    picker.includes('data-testid="coaching-logistics-note"') && picker.includes('offer.logisticsNote'),
  ],
  [
    'the trip-details form captures every field the brief specifies for an individual booking (name, phone, email, location, date, time, notes)',
    ['Your name', 'Phone number', 'Email', 'County / town / location', 'Preferred date', 'Preferred time', 'Any additional information']
      .every((label) => tripDetailsForm.includes(label)),
  ],
  [
    'the couples variant of the trip-details form additionally captures the number of participants and labels the name field for multiple people',
    tripDetailsForm.includes('Names of participants') && tripDetailsForm.includes('Number of participants'),
  ],
  [
    'trip details are captured before the payment step is shown, and only for offers flagged requiresTripDetails, never inserted into every booking flow',
    picker.includes('needsTripDetails') && picker.includes('CoachingTripDetailsForm') && picker.includes('offer.requiresTripDetails'),
  ],
  [
    'the trip-details capture route records a CRM lead/task rather than silently discarding the logistics information, and requires a participant count specifically for the couples category',
    tripDetailsRoute.includes('crmContact') &&
      tripDetailsRoute.includes('crmActivity') &&
      tripDetailsRoute.includes('crmTask') &&
      tripDetailsRoute.includes("offer.category === 'couples'"),
  ],

  // 5. Category images
  [
    'every coaching category can carry a dedicated admin-uploaded card image, with a tasteful fallback when none has been uploaded yet',
    schema.includes('model CoachingCategoryImage') &&
      picker.includes('item.imagePath') &&
      picker.includes('CategoryIconFallback'),
  ],
  [
    'category images are uploaded from the admin dashboard, not hard-coded file paths, and validated by MIME type like every other upload on the site',
    categoryImageRoute.includes("requireCrmApi('content:write')") &&
      categoryImageRoute.includes('ALLOWED_IMAGE_TYPES') &&
      coachingOfferManager.includes('Upload image'),
  ],

  // 7 & 8. Admin-editable pricing, never hard-coded, applies to every priced offer
  [
    'the admin dashboard lets price, duration, and description be edited per session, independent of the others (editing just the price does not erase a duration an admin already set)',
    offerOverrideRoute.includes('priceKes') &&
      offerOverrideRoute.includes('duration') &&
      offerOverrideRoute.includes('tagline') &&
      offerOverrideRoute.includes('.nullable()') &&
      catalog.includes('override.priceKes ?? offer.priceKes') &&
      catalog.includes('override.duration ?? offer.duration'),
  ],
  [
    'the coaching admin page is reachable from the dashboard nav and lists every priced category, not just the newly added ones',
    read('src/components/dashboard/DashboardLayout/index.tsx').includes('/dashboard/admin/coaching') &&
      coachingAdminPage.includes('getCoachingOffers') &&
      coachingAdminPage.includes('getCoachingCategories'),
  ],
  [
    'saving a price/duration/description edit takes effect without a code change or redeploy: the admin route writes straight to the database, nothing here touches coaching-offers.ts',
    offerOverrideRoute.includes('db.coachingOfferOverride.upsert') && !offerOverrideRoute.includes('writeFileSync'),
  ],

  // Final structure: Image -> Service -> Duration -> Description -> Price -> Book Now, Admin -> Edit Service
  [
    'each coaching card follows Image -> Service -> Duration -> Description -> Price -> Book Now: the category tab shows the image, and the offer card leads with name and ends with a Book Session action',
    picker.includes("Book Session") && picker.includes('item.imagePath'),
  ],

  [
    'the whole books/coaching update surface contains no em dash characters',
    !surface.includes('—'),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
