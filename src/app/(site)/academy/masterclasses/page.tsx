import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'
import { MasterclassCard } from '@/components/sections/academy/MasterclassCard'
import { programs } from '@/lib/data/programs'
import { WHATSAPP_URL } from '@/lib/utils/constants'

export const metadata: Metadata = {
  title: 'Programs & Masterclasses',
  description: 'System-first programs that move people from information to formation to transformation.',
}

export default function MasterclassesPage() {
  return (
    <>
      <section className="border-b border-navy-100 bg-cream">
        <div className="mx-auto max-w-content px-6 py-20">
          <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
            Programs
          </p>
          <h1 className="mt-4 font-heading text-4xl font-bold text-navy sm:text-5xl">
            Programs Built for Transformation
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-navy-600">
            A session inspires, but a system transforms. These programs move people from
            information to formation to transformation.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button href="/contact" size="lg">
              Contact Me
            </Button>
            <Button href={WHATSAPP_URL} variant="outline" size="lg">
              WhatsApp
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-navy-50">
        <div className="mx-auto max-w-content px-6 py-20">
          <div className="grid gap-6 sm:grid-cols-2">
            {programs.map((program) => (
              <MasterclassCard key={program.name} program={program} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
