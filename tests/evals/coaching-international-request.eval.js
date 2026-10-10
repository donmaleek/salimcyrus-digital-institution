const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')

const offersFile = read('src/lib/data/coaching-offers.ts')
const picker = read('src/components/payments/CoachingCategoryPicker/index.tsx')
const quoteForm = read('src/components/forms/CoachingQuoteRequestForm/index.tsx')
const quoteRoute = read('src/app/api/coaching/request-quote/route.ts')

const surface = [offersFile, picker, quoteForm, quoteRoute].join('\n')

// Both the individual and couples international tiers share one detail
// object; pull each tier's own slice of the source so checks can confirm
// both are wired to it (couples is a deliberate symmetric extension of a
// spec that named only the individual tier).
const tierBlock = (category) => {
  const start = offersFile.indexOf(`category: '${category}',\n    label: 'Your Preferred Location, Outside Kenya'`)
  if (start === -1) return ''
  const end = offersFile.indexOf('\n  },', start)
  return offersFile.slice(start, end)
}
const individualTier = tierBlock('individual')
const couplesTier = tierBlock('couples')

const checks = [
  [
    'the international individual and couples tiers both carry the rich detail object, not just a one-line description',
    individualTier.includes('detail: internationalCoachingDetail') &&
      couplesTier.includes('detail: internationalCoachingDetail') &&
      individualTier.includes('collectsLocationAndDate: true') &&
      couplesTier.includes('collectsLocationAndDate: true'),
  ],
  [
    'duration and rate are stated as policy, never fabricated as a fixed number or time',
    offersFile.includes("durationNote: 'By mutual agreement'") &&
      offersFile.includes("rateNote: 'Available upon request'") &&
      !/durationNote:\s*'\d/.test(offersFile) &&
      !/rateNote:\s*'(KES|\$|\d)/.test(offersFile),
  ],
  [
    'all three international engagement arrangements from the spec are present: accommodation, travel/logistics, and the booking deposit',
    offersFile.includes("label: 'Accommodation'") &&
      offersFile.includes("label: 'Travel & Logistical Arrangements'") &&
      offersFile.includes("label: 'Booking Deposit'") &&
      offersFile.includes('A deposit is required to secure the engagement'),
  ],
  [
    'the four-step how-to-book sequence from the spec is present in order',
    (() => {
      const steps = [...offersFile.matchAll(/'([^']*(?:Submit an international|Provide your preferred|Discuss session duration|Receive confirmation)[^']*)'/g)].map(
        (m) => m[1]
      )
      return (
        steps.length === 4 &&
        steps[0].startsWith('Submit an international') &&
        steps[1].startsWith('Provide your preferred') &&
        steps[2].startsWith('Discuss session duration') &&
        steps[3].startsWith('Receive confirmation')
      )
    })(),
  ],
  [
    'the call to action reads "Request International Coaching", matching the spec exactly',
    offersFile.includes("ctaLabel: 'Request International Coaching'"),
  ],
  [
    'the picker renders every arrangement and the how-to-book steps for a tier that has detail, not just the plain description',
    picker.includes('detail.arrangements.map') &&
      picker.includes('detail.howToBook.map') &&
      picker.includes('coaching-request-arrangements'),
  ],
  [
    'the picker shows the tier CTA label on its button and falls back gracefully for tiers with no detail (Group, VIP Summit)',
    picker.includes("detail?.ctaLabel ?? 'Request a proposal'") &&
      picker.includes("detail?.durationNote ?? 'By mutual agreement'") &&
      picker.includes("detail?.rateNote ?? 'Custom proposal'"),
  ],
  [
    'the picker passes collectsLocationAndDate through to the quote request form rather than hard-coding the field set per category',
    picker.includes('collectsLocationAndDate={tier.collectsLocationAndDate}'),
  ],
  [
    'the quote request form only collects preferred location/date when the tier asks for it, and still never exposes a free-text category or tier field',
    quoteForm.includes('collectsLocationAndDate') &&
      quoteForm.includes('quote-location-') &&
      quoteForm.includes('quote-date-') &&
      !quoteForm.includes('<select'),
  ],
  [
    'preferred location and date are sent to the API only when collected, never fabricated as empty strings for tiers that do not ask for them',
    quoteForm.includes('preferredLocation: collectsLocationAndDate ? preferredLocation : undefined') &&
      quoteForm.includes('preferredDate: collectsLocationAndDate ? preferredDate : undefined'),
  ],
  [
    'the request-quote route accepts the optional preferred location/date and still never fabricates or records a price',
    quoteRoute.includes('preferredLocation: z.string()') &&
      quoteRoute.includes('preferredDate: z.string()') &&
      !quoteRoute.includes('priceKes'),
  ],
  [
    'when a preferred location/date is submitted, it lands in the CRM activity body so the first follow-up already has logistics, not just the free-text message',
    quoteRoute.includes('Preferred location: ${data.preferredLocation}') &&
      quoteRoute.includes('Preferred dates: ${data.preferredDate}') &&
      quoteRoute.includes('activityBody'),
  ],
  [
    'the whole international coaching request surface contains no em dash characters',
    !surface.includes('—'),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
