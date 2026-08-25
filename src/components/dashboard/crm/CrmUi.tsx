import Link from 'next/link'

export function CrmPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-5 border-b border-navy-100 pb-7 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-600">
          {eyebrow}
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-navy sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-navy-500">
          {description}
        </p>
      </div>
      {action}
    </div>
  )
}

export function MetricCard({
  label,
  value,
  detail,
  tone = 'navy',
}: {
  label: string
  value: string
  detail: string
  tone?: string
}) {
  const accent =
    tone === 'red'
      ? 'bg-red-500'
      : tone === 'green'
        ? 'bg-emerald-500'
        : tone === 'gold'
          ? 'bg-gold'
          : 'bg-navy'
  return (
    <article className="relative overflow-hidden rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
      <span className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
      <p className="text-xs font-bold uppercase tracking-wider text-navy-400">
        {label}
      </p>
      <p className="mt-3 font-heading text-3xl font-bold text-navy">{value}</p>
      <p className="mt-2 text-xs leading-5 text-navy-500">{detail}</p>
    </article>
  )
}

export function StatusBadge({ value }: { value: string }) {
  const positive = [
    'active',
    'won',
    'successful',
    'completed',
    'received',
    'reconciled',
    'published',
  ].includes(value)
  const negative = [
    'lost',
    'failed',
    'overdue',
    'urgent',
    'unmatched',
  ].includes(value)
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${positive ? 'bg-emerald-50 text-emerald-700' : negative ? 'bg-red-50 text-red-700' : 'bg-gold-50 text-gold-600'}`}
    >
      {value.replaceAll('_', ' ')}
    </span>
  )
}

export function EmptyState({
  title,
  detail,
  href,
  action,
}: {
  title: string
  detail: string
  href?: string
  action?: string
}) {
  return (
    <div className="rounded-2xl border border-dashed border-navy-200 bg-white/60 p-8 text-center">
      <p className="font-heading text-lg font-bold text-navy">{title}</p>
      <p className="mx-auto mt-2 max-w-lg text-sm text-navy-500">{detail}</p>
      {href && action && (
        <Link
          href={href}
          className="mt-4 inline-flex rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white"
        >
          {action}
        </Link>
      )}
    </div>
  )
}

export const money = (minor: number, currency = 'KES') =>
  new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(minor / 100)
export const date = (value: Date | string) =>
  new Intl.DateTimeFormat('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
