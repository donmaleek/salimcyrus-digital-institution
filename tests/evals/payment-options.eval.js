const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')
const page = read('src/app/(site)/support-the-mission/page.tsx')
const options = read('src/components/payments/DonationPaymentOptions/index.tsx')
const constants = read('src/lib/utils/constants.ts')
const route = read('src/app/api/payments/initiate/route.ts')
const service = read('src/services/payments/paystack.ts')

const checks = [
  [
    'support page presents Paystack and PayPal as live payment methods (Paybill was removed as a checkout option)',
    ['Paystack', 'PayPal'].every((method) => page.includes(method)) &&
      !page.includes('M-Pesa') &&
      options.includes("fetch('/api/payments/initiate'"),
  ],
  [
    'PayPal is a real checkout, not a manual "send money to this email" instruction',
    options.includes("fetch('/api/payments/paypal-donate'") &&
      !options.includes('PAYPAL_EMAIL'),
  ],
  [
    'PayPal donation checkout charges in USD (PayPal does not support KES)',
    read('src/app/api/payments/paypal-donate/route.ts').includes('amountUsd'),
  ],
  [
    'Paystack donation UI calls the server-side initializer',
    route.includes('PAYSTACK_SECRET_KEY') &&
      service.includes('transaction/initialize') &&
      options.includes('Continue to Paystack'),
  ],
  [
    'Paystack amount is converted to the smallest currency unit',
    service.includes('amount: amountKes * 100'),
  ],
  [
    'support page links the verified Tuko feature',
    page.includes('TUKO_FEATURE_URL') &&
      constants.includes('tuko.co.ke/people/family/445138'),
  ],
  [
    'donation payment options are a clean two-column layout now that Paybill is gone, not a stale three-column grid',
    options.includes('lg:grid-cols-2') && !options.includes('lg:grid-cols-3'),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks)
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
