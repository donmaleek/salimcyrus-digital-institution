const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')

const confirmation = read('src/app/api/booking/confirm/route.ts')
const webhook = read('src/app/api/payments/webhook/route.ts')
const availability = read('src/app/api/admin/availability/route.ts')
const form = read('src/components/forms/BookingConfirmForm/index.tsx')
const schema = read('prisma/schema.prisma')

const checks = [
  [
    'customer confirmation requires payment evidence from a real payment provider (Paystack webhook, PayPal capture, or an approved Paybill claim), not just any booking row',
    confirmation.includes('paymentReference') &&
      confirmation.includes("transaction.status !== 'successful'") &&
      confirmation.includes('VERIFIED_BOOKING_SOURCES.has(paidBooking.source)') &&
      confirmation.includes('VERIFIED_PROVIDERS.has(transaction.provider)') &&
      confirmation.includes("'paystack_webhook'") &&
      confirmation.includes("'paypal_checkout'") &&
      confirmation.includes("'paybill_checkout'"),
  ],
  [
    'payment and confirmation update one booking record',
    webhook.includes("status: 'paid'") &&
      confirmation.includes('tx.booking.update') &&
      !confirmation.includes('tx.booking.create'),
  ],
  [
    'confirmation state is explicit and replay safe',
    schema.includes('confirmedAt') && confirmation.includes('paidBooking.confirmedAt'),
  ],
  [
    'slot claims reject booked and past inventory atomically',
    confirmation.includes('availabilitySlot.updateMany') &&
      confirmation.includes('isBooked: false') &&
      confirmation.includes('startTime: { gt: new Date() }'),
  ],
  [
    'Paystack retry evidence is idempotent',
    webhook.includes('existingTransaction') &&
      webhook.includes('if (!existingTransaction)') &&
      webhook.includes("isolationLevel: 'Serializable'"),
  ],
  [
    'availability changes reject overlap and leave audit evidence',
    availability.includes('slotsOverlap') &&
      availability.includes("entityType: 'AvailabilitySlot'"),
  ],
  [
    'availability transport failure has a visible fallback',
    form.includes('slotsError') &&
      form.includes('Available times could not be loaded'),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) {
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
}
if (failures.length) process.exit(1)
