const fs = require('node:fs')
const path = require('node:path')
const read = p => fs.readFileSync(path.resolve(__dirname, '../..', p), 'utf8')
const picker = read('src/components/payments/CoachingCategoryPicker/index.tsx')
const page = read('src/app/(site)/book-now/page.tsx')
const checkout = read('src/components/payments/CoachingCheckoutForm/index.tsx')
const checks = [
  ['choices wrap and do not require sideways scrolling', picker.includes('grid gap-3 sm:grid-cols-2') && !picker.includes('overflow-x-auto')],
  ['one clear heading and three plain progress steps orient the client', picker.includes('What would you like help with?') && picker.includes('Choose your session') && picker.includes('Your details & payment') && picker.includes('Booking progress')],
  ['type choices have explicit accessible names and live starting prices', picker.includes('aria-label={`Choose ${item.name}`}') && picker.includes('From ${formatCurrency') && picker.includes('{item.description}')],
  ['decision and payment controls use readable text and 48px touch targets', picker.includes('min-h-12') && picker.includes('text-base font-semibold') && checkout.includes('min-h-12')],
  ['client can edit the type and session without searching another screen', picker.includes('Change session type') && picker.includes('Back to sessions')],
  ['payment is hidden until a session is chosen', picker.includes('step === 3 && offer') && picker.includes('step === 3 && tier')],
  ['every price is visible before payment', page.includes('Every price is shown before payment.')],
  ['booking is no longer buried behind a marketing hero or process essay', !page.includes('PageHero') && !page.includes('bookingSteps')],
]
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (checks.some(([, passed]) => !passed)) process.exit(1)
