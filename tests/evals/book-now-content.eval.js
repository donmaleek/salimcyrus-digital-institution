const fs = require('node:fs')
const path = require('node:path')
const root = path.resolve(__dirname, '../..')
const read = p => fs.readFileSync(path.join(root, p), 'utf8')
const page = read('src/app/(site)/book-now/page.tsx')
const intro = read('src/components/layout/BookingIntro/index.tsx')
const picker = read('src/components/payments/CoachingCategoryPicker/index.tsx')
const flow = read('src/components/payments/CoachingCategoryPicker/booking-flow.ts')
const offers = read('src/lib/data/coaching-offers.ts')
const checks = [
  ['booking uses a short task header instead of the 780px marketing hero', page.includes('BookingIntro') && !page.includes('PageHero') && !intro.includes('min-h-[780px]')],
  ['one decision step is presented at a time', ['step === 1 &&', 'step === 2 &&', 'step === 3 &&'].every(s => picker.includes(s))],
  ['all published types and live offer prices are supplied by the catalog', page.includes('getCoachingCategories()') && page.includes('getCoachingOffers()') && picker.includes('categories.map') && picker.includes('formatCurrency(offer.priceKes)') && (offers.match(/priceKes: \d+/g) || []).length === 12],
  ['offer choices explain duration, fit and outcome without crowding payment', picker.includes('{offer.duration}') && picker.includes('What this session includes') && picker.includes('You leave with:')],
  ['step changes move focus and scroll to the next decision', picker.includes('focus({ preventScroll: true })') && picker.includes('scrollIntoView') && picker.includes('tabIndex={-1}')],
  ['back controls and browser history restore editable selections', picker.includes('Back to sessions') && picker.includes('Change session type') && picker.includes("addEventListener('popstate'") && flow.includes("params.get('offer')")],
  ['quote requests open directly without a second reveal button', picker.includes('initiallyExpanded') && picker.includes('CoachingQuoteRequestForm')],
  ['travel logistics remain required before checkout', picker.includes('needsTripDetails && !tripDone') && picker.includes('offer?.requiresTripDetails') && picker.includes('CoachingTripDetailsForm')],
  ['the selected category image sits below help text in one supporting panel', picker.includes('activeCategory.imagePath') && picker.includes('aspect-[16/9] w-full') && picker.includes('CategoryIconFallback') && picker.indexOf('A clear next step') < picker.indexOf('activeCategory.imagePath')],
  ['payment and scheduling order is explained before checkout', picker.includes('After payment, choose an available date and time') && intro.includes('/book-now/confirm')],
  ['help and scope boundaries remain accessible', page.includes('not emergency support') && page.includes('therapy') && page.includes('href="/contact"') && picker.includes('WHATSAPP_URL')],
  ['booking copy uses no em dash characters', ![page, intro, picker].join('').includes('—')],
]
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (checks.some(([, passed]) => !passed)) process.exit(1)
