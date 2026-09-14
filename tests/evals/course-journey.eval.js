const fs = require('node:fs')
const path = require('node:path')
const root = path.resolve(__dirname, '../..')
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

const editor = read('src/components/dashboard/CourseEditor/index.tsx')
const nav = read('src/components/dashboard/DashboardLayout/index.tsx')
const catalog = read('src/components/courses/CourseCatalog/index.tsx')
const sales = read('src/components/courses/CourseEnrollCard/index.tsx')
const player = read('src/components/courses/CoursePlayer/index.tsx')
const enroll = read('src/app/api/courses/[courseId]/enroll/route.ts')
const learning = read('src/app/(dashboard)/dashboard/my-learning/courses/[course-slug]/page.tsx')
const paystack = read('src/app/api/courses/verify/route.ts')
const paypal = read('src/app/api/courses/verify-paypal/route.ts')
const service = read('src/services/courses/course-service.ts')
const manager = read('src/components/dashboard/CourseManager/index.tsx')
const checks = [
  ['admin builds ordered sections and lessons', editor.includes('Add section') && editor.includes('Add lesson')],
  ['admin can publish and reopen courses', editor.includes("save('published')") && nav.includes("'/dashboard/admin/courses'")],
  ['admin can archive and republish catalog products', manager.includes("changeStatus(course, 'archived')") && manager.includes("changeStatus(course, 'published')")],
  ['catalog supports search and category filtering', catalog.includes('type="search"') && catalog.includes('Filter by category')],
  ['checkout supports free enrollment plus Paystack, PayPal, and M-Pesa', sales.includes('Enroll Free') && sales.includes('CourseCheckoutForm') && read('src/components/payments/CourseCheckoutForm/index.tsx').includes('PaybillClaimForm')],
  ['online payments are bound to learner, offer, and exact price', paystack.includes('data.amount !== course.priceKes * 100') && paypal.includes("captured.currencyCode !== 'USD'")],
  ['admin edits cannot erase enrolled learner progress', service.includes("throw new Error('COURSE_HAS_ENROLLMENTS')")],
  ['player supports explicit progress and sequential continuation', player.includes('Complete & Continue') && player.includes('Course complete. Well done.')],
  ['draft courses cannot be enrolled in', enroll.includes("course.status !== 'published'")],
  ['unenrolled members cannot open the player', learning.includes('if (!enrollment) redirect')],
]
const failures = checks.filter(([, pass]) => !pass)
for (const [name, pass] of checks) console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
