const fs = require('node:fs')
const path = require('node:path')
const surface = fs.readFileSync(path.join(__dirname, 'index.tsx'), 'utf8')
const transport = fs.readFileSync(path.join(__dirname, 'checkout.ts'), 'utf8')
const checks = [
  ['Paystack uses browser email validation', surface.includes('<form onSubmit={submitPaystack}') && surface.includes('type="email"') && surface.includes('required') && surface.includes('type="submit"')],
  ['PayPal remains outside the receipt email form', surface.indexOf('</form>') < surface.indexOf("startCheckout('paypal')")],
  ['both providers show explicit currency totals', surface.includes('KES {priceKes') && surface.includes('USD ${priceUsd')],
  ['scheduling order is explained before payment', surface.includes('After payment, return here to choose an available session time')],
  ['every checkout attempt clears processing', surface.includes('finally {') && surface.includes('setBusy(null)')],
  ['payment failure provides a contact route', surface.includes('role="alert"') && surface.includes('href="/contact"')],
  ['provider network and malformed JSON errors are handled', transport.includes('Could not connect to') && transport.includes('await response.json()') && transport.includes('throw new Error(fallback)')],
  ['decision controls meet 48 pixel target', (surface.match(/min-h-12/g) || []).length >= 3],
]
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (checks.some(([, passed]) => !passed)) process.exit(1)
