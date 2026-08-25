import { db } from '@/lib/db'
import type { AttentionItem, ExecutiveMetric } from './contracts'

const money = (minor: number, currency = 'KES') =>
  new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(minor / 100)

export async function getExecutiveDashboard() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    contacts,
    contactCount,
    opportunities,
    tasks,
    transactions,
    cases,
    orders,
    programs,
    campaigns,
    donations,
  ] = await Promise.all([
    db.crmContact.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    db.crmContact.count({ where: { deletedAt: null } }),
    db.crmOpportunity.findMany({
      include: { stage: true, contact: true },
      orderBy: { updatedAt: 'desc' },
    }),
    db.crmTask.findMany({
      where: { status: { not: 'completed' } },
      include: { contact: true, assignee: true },
      orderBy: { dueAt: 'asc' },
      take: 12,
    }),
    db.crmTransaction.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      orderBy: { createdAt: 'desc' },
    }),
    db.crmCase.findMany({
      where: { status: { not: 'resolved' } },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
      take: 10,
    }),
    db.crmOrder.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    db.crmProgram.findMany({
      where: { status: { in: ['active', 'enrolling'] } },
      include: { _count: { select: { enrollments: true } } },
    }),
    db.crmCampaign.findMany({
      where: { status: { in: ['active', 'scheduled'] } },
      include: { _count: { select: { members: true } } },
    }),
    db.crmDonation.findMany({
      where: { receivedAt: { gte: thirtyDaysAgo }, status: 'received' },
    }),
  ])

  const successful = transactions.filter(
    (transaction) => transaction.status === 'successful'
  )
  const revenueMinor = successful.reduce(
    (sum, transaction) => sum + transaction.netMinor,
    0
  )
  const pendingMinor = transactions
    .filter((transaction) => transaction.status === 'pending')
    .reduce((sum, transaction) => sum + transaction.grossMinor, 0)
  const openOpportunities = opportunities.filter(
    (opportunity) => opportunity.status === 'open'
  )
  const pipelineMinor = openOpportunities.reduce(
    (sum, opportunity) => sum + opportunity.amountMinor,
    0
  )
  const weightedMinor = openOpportunities.reduce(
    (sum, opportunity) =>
      sum +
      Math.round((opportunity.amountMinor * opportunity.probability) / 100),
    0
  )
  const overdue = tasks.filter((task) => task.dueAt < now)
  const unmatched = transactions.filter(
    (transaction) => transaction.reconciliationStatus === 'unmatched'
  )
  const won = opportunities.filter(
    (opportunity) => opportunity.status === 'won'
  ).length
  const closed = opportunities.filter((opportunity) =>
    ['won', 'lost'].includes(opportunity.status)
  ).length
  const conversion = closed ? Math.round((won / closed) * 100) : 0

  const metrics: ExecutiveMetric[] = [
    {
      label: 'Net collections · 30 days',
      value: money(revenueMinor),
      detail: `${successful.length} successful payments`,
      tone: 'green',
    },
    {
      label: 'Open pipeline',
      value: money(pipelineMinor),
      detail: `${money(weightedMinor)} weighted forecast`,
      tone: 'gold',
    },
    {
      label: 'Relationships',
      value: String(contactCount),
      detail: `${conversion}% closed-deal conversion`,
      tone: 'navy',
    },
    {
      label: 'Needs action',
      value: String(overdue.length + unmatched.length + cases.length),
      detail: `${overdue.length} overdue · ${unmatched.length} unmatched`,
      tone: overdue.length ? 'red' : 'navy',
    },
    {
      label: 'Pending collections',
      value: money(pendingMinor),
      detail: 'Operational revenue, not accounting profit',
      tone: 'gold',
    },
    {
      label: 'Active delivery',
      value: String(programs.length),
      detail: `${programs.reduce((sum, program) => sum + program._count.enrollments, 0)} enrollments`,
      tone: 'navy',
    },
  ]

  const attention: AttentionItem[] = [
    ...overdue.map((task) => ({
      id: `task-${task.id}`,
      severity: 'critical' as const,
      title: task.title,
      detail: `Overdue · ${task.contact?.displayName ?? task.assignee?.name ?? 'Unassigned'}`,
      href: '/dashboard/admin/crm/tasks',
    })),
    ...unmatched.map((transaction) => ({
      id: `payment-${transaction.id}`,
      severity: 'warning' as const,
      title: 'Payment needs reconciliation',
      detail: `${money(transaction.grossMinor, transaction.currency)} via ${transaction.provider}`,
      href: '/dashboard/admin/crm/revenue',
    })),
    ...cases.map((item) => ({
      id: `case-${item.id}`,
      severity:
        item.priority === 'urgent'
          ? ('critical' as const)
          : ('warning' as const),
      title: item.subject,
      detail: `${item.category} · ${item.status}`,
      href: '/dashboard/admin/crm/service',
    })),
  ].slice(0, 10)

  return {
    metrics,
    attention,
    contacts,
    opportunities: opportunities.slice(0, 8),
    tasks,
    transactions,
    orders,
    programs,
    campaigns,
    donations,
  }
}
