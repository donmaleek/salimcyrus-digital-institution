import Image from 'next/image'
import Link from 'next/link'

/**
 * Bio text matches the established copy already used on /about and in the
 * root layout's JSON-LD (see src/app/layout.tsx) — no new claims invented
 * for this card.
 */
export function AuthorCard() {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-navy-100 bg-white p-5">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full">
        <Image
          src="/images/salim/coaching-hero.webp"
          alt="Salim Cyrus"
          fill
          sizes="64px"
          className="object-cover object-[65%_20%]"
        />
      </div>
      <div>
        <p className="font-heading text-base font-bold text-navy">About the author</p>
        <Link href="/about" className="font-semibold text-navy underline-offset-2 hover:underline">
          Salim Cyrus
        </Link>
        <p className="mt-1 text-sm leading-relaxed text-navy-600">
          Relationship Coach | Speaker | Author | Kingdom Strategist. Helping people
          renew their thinking, strengthen relationships, and live with purpose
          through truth, wisdom, and practical structure.
        </p>
      </div>
    </div>
  )
}
