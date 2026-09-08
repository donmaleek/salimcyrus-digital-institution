const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')
const page = read('src/app/(site)/support-the-mission/page.tsx')
const options = read('src/components/payments/DonationPaymentOptions/index.tsx')
const claimForm = read('src/components/payments/PaybillClaimForm/index.tsx')
const constants = read('src/lib/utils/constants.ts')
const route = read('src/app/api/payments/initiate/route.ts')
const service = read('src/services/payments/paystack.ts')

const checks = [
  [
    'support page presents both live payment methods and does not claim Paystack is offered',
    ['M-Pesa', 'PayPal'].every((method) => page.includes(method)) && !page.includes('Paystack, M-Pesa'),
  ],
  [
    'Paybill details match the supplied artwork',
    constants.includes("MPESA_PAYBILL_NUMBER = '303030'") &&
      constants.includes("MPESA_ACCOUNT_NUMBER = 'S6UB#'"),
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
    'payment values have copy controls',
    claimForm.includes('navigator.clipboard.writeText'),
  ],
  [
    'Paybill claims require structured evidence (an M-Pesa code), not just a promise',
    claimForm.includes('mpesaCode') && read('src/app/api/payments/paybill/claim/route.ts').includes('mpesaCode'),
  ],
  [
    'Paybill payments never grant access on submission alone, only approvePaymentClaim can record a real purchase',
    (() => {
      const claims = read('src/services/payments/payment-claims.ts')
      const submitFn = claims.slice(claims.indexOf('export async function submitPaymentClaim'), claims.indexOf('export type ReviewPaymentClaimResult'))
      const approveFn = claims.slice(claims.indexOf('export async function approvePaymentClaim'))
      return (
        submitFn.includes('db.paymentClaim.create') &&
        !submitFn.includes('recordBookPurchase') &&
        approveFn.includes('recordBookPurchase') &&
        approveFn.includes('recordTeachingPurchase') &&
        approveFn.includes('recordDonation')
      )
    })(),
  ],
  [
    'Paystack backend is kept intact (not deleted) even though the UI no longer offers it, so it can be re-enabled',
    route.includes('PAYSTACK_SECRET_KEY') &&
      service.includes('transaction/initialize'),
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
    'Paybill artwork is optimized and available',
    fs.existsSync(path.join(root, 'public/images/payments/mpesa-paybill.webp')),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks)
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
