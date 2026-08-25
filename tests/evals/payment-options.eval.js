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
    'support page presents all three payment methods',
    ['Paystack', 'M-Pesa', 'PayPal'].every((method) => page.includes(method)),
  ],
  [
    'Paybill details match the supplied artwork',
    constants.includes("MPESA_PAYBILL_NUMBER = '303030'") &&
      constants.includes("MPESA_ACCOUNT_NUMBER = 'S6UB#'"),
  ],
  [
    'PayPal uses the confirmed recipient email',
    constants.includes("PAYPAL_EMAIL = 'salimcyrus@gmail.com'"),
  ],
  [
    'payment values have copy controls',
    options.includes('navigator.clipboard.writeText'),
  ],
  [
    'Paystack checkout initializes only on the server',
    route.includes('PAYSTACK_SECRET_KEY') &&
      service.includes('transaction/initialize'),
  ],
  [
    'Paystack amount is converted to the smallest currency unit',
    service.includes('amount: amountKes * 100'),
  ],
  [
    'Paystack return state gives a reconciliation message',
    page.includes("searchParams?.payment === 'returned'") &&
      page.includes('transaction reference'),
  ],
  [
    'support page links the verified Tuko feature',
    page.includes('TUKO_FEATURE_URL') &&
      constants.includes('tuko.co.ke/people/family/445138'),
  ],
  [
    'Paybill artwork is optimized and available',
    fs.existsSync(path.join(root, 'public/images/payments/mpesa-paybill.webp')),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks)
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
