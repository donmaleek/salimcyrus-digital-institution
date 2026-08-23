import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils/currency'
import { WHATSAPP_URL } from '@/lib/utils/constants'
import type { Program } from '@/lib/data/programs'

export function MasterclassCard({ program }: { program: Program }) {
  return (
    <div className="flex flex-col rounded-2xl border border-navy-100 bg-white p-8">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-gold-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold-500">
          {program.tag}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-navy-400">
          {program.duration}
        </span>
      </div>
      <h3 className="mt-4 font-heading text-xl font-semibold text-navy">{program.name}</h3>
      <p className="mt-1 text-sm font-medium text-navy-500">{program.focus}</p>
      <p className="mt-4 text-sm text-navy-600">{program.description}</p>

      <ul className="mt-4 space-y-1">
        {program.highlights.map((h) => (
          <li key={h} className="text-sm text-navy-600">
            &bull; {h}
          </li>
        ))}
      </ul>

      {program.scripture && (
        <p className="mt-4 rounded-lg bg-navy-50 p-3 text-xs italic text-navy-500">
          {program.scripture}
        </p>
      )}

      <p className="mt-6 text-sm italic text-navy-700">&ldquo;{program.closingLine}&rdquo;</p>

      <div className="mt-6 flex flex-1 items-end justify-between gap-4">
        <div>
          <p className="text-xl font-bold text-navy">
            {formatCurrency(program.priceKes)}
            {program.recurring && <span className="text-sm font-normal text-navy-400">/mo</span>}
          </p>
          <p className="text-xs text-navy-400">
            USD {program.priceUsd}
            {program.recurring && '/mo'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button href={program.paystackUrl} size="sm">
            Apply
          </Button>
          <Button href={WHATSAPP_URL} variant="ghost" size="sm">
            WhatsApp
          </Button>
        </div>
      </div>
    </div>
  )
}
