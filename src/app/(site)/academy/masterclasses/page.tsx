import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/layout/PageHero'
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
      <PageHero
        eyebrow="Programs"
        title="Programs Built for Transformation"
        description="A session inspires, but a system transforms. These programs move people from information to formation to transformation."
        actions={
          <>
            <Button href="/contact" size="lg">
              Contact Me
            </Button>
            <Button href={WHATSAPP_URL} variant="outline-inverse" size="lg">
              WhatsApp
            </Button>
          </>
        }
      />

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
