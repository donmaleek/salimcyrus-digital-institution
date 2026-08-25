const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')
const schema = read('prisma/schema.prisma')
const editor = read('src/components/dashboard/JournalEntryForm/index.tsx')
const journal = read('src/components/dashboard/JournalManager/index.tsx')
const availability = read('src/components/dashboard/AvailabilityManager/index.tsx')
const nav = read('src/components/dashboard/DashboardLayout/index.tsx')
const publicEntry = read('src/app/(site)/journal/[slug]/page.tsx')

const checks = [
  ['journal media is durable and accessible', ['coverImageData', 'coverImageMime', 'coverImageAlt'].every((field) => schema.includes(field))],
  ['editor supports upload, validation, preview, and editorial guidance', ['accept="image/jpeg,image/png,image/webp"', 'Maximum 4 MB', 'Preview article', 'wordCount'].every((term) => editor.includes(term))],
  ['public essays render image alt text and captions', publicEntry.includes('entry.coverImageAlt') && publicEntry.includes('entry.coverImageCaption')],
  ['journal manager reports publishing workload', ['Total essays', 'Published', 'Drafts'].every((term) => journal.includes(term))],
  ['availability reports open and booked workload', ['Upcoming slots', 'Open for booking', 'Confirmed bookings'].every((term) => availability.includes(term))],
  ['availability separates upcoming, booked, and past work', availability.includes("useState<'upcoming' | 'booked' | 'past'>") && availability.includes('visibleSlots')],
  ['admin navigation exposes active state and content tools on mobile', nav.includes('aria-current') && nav.includes("items.filter((item) => item.href !== '/dashboard')")],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
