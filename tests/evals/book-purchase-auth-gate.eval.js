const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')

const checkoutRoute = read('src/app/api/books/checkout/route.ts')
const detail = read('src/app/(site)/books/[slug]/page.tsx')
const loginForm = read('src/components/forms/LoginForm/index.tsx')
const registerForm = read('src/components/forms/RegisterForm/index.tsx')
const loginPage = read('src/app/(auth)/login/page.tsx')
const registerPage = read('src/app/(auth)/register/page.tsx')
const benefitsPanel = read('src/components/auth/MemberBenefitsPanel/index.tsx')
const safeRedirect = read('src/lib/utils/safe-redirect.ts')
const checkoutForm = read('src/components/payments/BookCheckoutForm/index.tsx')

const checks = [
  [
    'checkout API requires a session, not just the UI hiding the form (a direct request can\'t skip it)',
    checkoutRoute.includes('getServerSession(authOptions)') &&
      checkoutRoute.includes('status: 401'),
  ],
  [
    'checkout API charges the session email, never a client-submitted one (can\'t buy under a different account)',
    checkoutRoute.includes('email: session.user.email') &&
      !checkoutRoute.includes('email: parsed.data.email'),
  ],
  [
    'book detail page shows a sign-in gate instead of the checkout form when logged out',
    detail.includes('data-testid="book-signin-gate"') && detail.includes('buyerEmail'),
  ],
  [
    'sign-in gate links to register/login with this exact book as the callback target',
    detail.includes('/register?callbackUrl=') && detail.includes('/login?callbackUrl='),
  ],
  [
    'checkout form no longer accepts a free-typed email (removed in favor of the session email)',
    checkoutForm.includes('email: string') && !checkoutForm.includes('name="email"'),
  ],
  [
    'login and register redirects go through the safe-redirect helper, not a raw callbackUrl (open-redirect guard)',
    loginForm.includes('safeRedirectPath') &&
      registerForm.includes('isSafeRedirectPath') &&
      safeRedirect.includes("path.startsWith('//')"),
  ],
  [
    'login/register pages only show the member benefits panel for a book-purchase callback, not every visit',
    loginPage.includes('MemberBenefitsPanel') &&
      loginPage.includes("callbackUrl.startsWith('/books/')") &&
      registerPage.includes('MemberBenefitsPanel') &&
      registerPage.includes("callbackUrl.startsWith('/books/')"),
  ],
  [
    'member benefits panel is explicitly labeled not-yet-available (no promise of features that don\'t exist)',
    benefitsPanel.includes('Coming to your member dashboard') &&
      benefitsPanel.includes('rolling out'),
  ],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
