const fs = require('node:fs')
const path = require('node:path')
const root = path.resolve(__dirname, '../..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')
const schema = read('prisma/schema.prisma')
const dashboard = read('src/app/(dashboard)/dashboard/admin/crm/page.tsx')
const nav = read('src/components/dashboard/DashboardLayout/index.tsx')
const seed = read('scripts/seed-crm.js')
const webhook = read('src/app/api/payments/webhook/route.ts')
const booking = read('src/app/api/booking/confirm/route.ts')
const contact = read('src/app/api/contact/route.ts')

const requiredModels = [
  'CrmContact',
  'CrmOrganization',
  'CrmActivity',
  'CrmTask',
  'CrmOpportunity',
  'CrmTransaction',
  'CrmOrder',
  'CrmProduct',
  'CrmProgram',
  'CrmEnrollment',
  'CrmCampaign',
  'CrmDonation',
  'CrmAuditEvent',
  'CrmIntegration',
]
const requiredWorkspaces = [
  'Command Center',
  'Relationships',
  'Pipeline',
  'Tasks & Service',
  'Revenue',
  'Delivery',
  'Books & Orders',
  'Marketing',
  'Community & Impact',
  'Reports',
]
const checks = [
  [
    'unified relationship and operations schema exists',
    requiredModels.every((model) => schema.includes(`model ${model}`)),
  ],
  [
    'every important record can expose ownership and next action',
    schema.includes('ownerId') &&
      schema.includes('nextActionAt') &&
      schema.includes('assigneeId'),
  ],
  [
    'executive command center leads with actionable signals',
    dashboard.includes('Needs attention') &&
      dashboard.includes('Next actions') &&
      dashboard.includes('Live pipeline'),
  ],
  [
    'all Salim business workspaces are navigable',
    requiredWorkspaces.every((label) => nav.includes(label)),
  ],
  [
    'site catalog seeds all current books and programs, priced per book',
    seed.includes('concealed-redemption') &&
      seed.includes('the-deception') &&
      seed.includes('marriage-and-knowing-the-right-partner') &&
      !seed.includes('the-unhealed-traumas-of-our-parents') &&
      !seed.includes('the-great-deception-of-pornography') &&
      seed.includes('Healing and Restoration Intensive') &&
      seed.includes('priceMinor: priceKes * 100'),
  ],
  [
    'Paystack events create CRM money and activity records',
    webhook.includes('crmTransaction.upsert') &&
      webhook.includes('crmActivity.create'),
  ],
  [
    'bookings create a protected follow-up obligation',
    booking.includes('crmTask.create') && booking.includes('nextActionAt'),
  ],
  [
    'website enquiries enter the CRM instead of mailto',
    contact.includes('crmContact') && contact.includes('crmTask'),
  ],
  [
    'mutations preserve audit evidence',
    ['contacts/route.ts', 'tasks/route.ts', 'opportunities/route.ts'].every(
      (file) =>
        read(`src/app/api/admin/crm/${file}`).includes('crmAuditEvent.create')
    ),
  ],
]
const failures = checks.filter(([, pass]) => !pass)
for (const [name, pass] of checks)
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
