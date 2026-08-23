import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'
import { CONTACT_EMAIL, WHATSAPP_URL } from '@/lib/utils/constants'

export const metadata: Metadata = {
  title: 'Press Kit',
  description: 'Biography, credentials, and contact information for booking Salim Cyrus.',
}

const credentials = [
  'Certified Life Coach (2023)',
  'Advanced Emotional Intelligence (2022)',
  'Strategic Accountability Coach (2024)',
  'Human Potential Practitioner (2021)',
  'Decision Architecture Specialist (2020)',
]

export default function PressKitPage() {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-content px-6 py-20">
        <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
          Press Kit
        </p>
        <h1 className="mt-4 font-heading text-4xl font-bold text-navy sm:text-5xl">
          Everything an Organizer Needs
        </h1>

        <div className="mt-14 grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-heading text-xl font-semibold text-navy">Short Bio</h2>
            <p className="mt-3 text-navy-600">
              Salim Cyrus is a private coach helping high-responsibility people move from drift to
              structure — clarity, accountability, and decisions, not motivation.
            </p>

            <h2 className="mt-10 font-heading text-xl font-semibold text-navy">Long Bio</h2>
            <p className="mt-3 text-navy-600">
              Salim Cyrus blends deep listening, structured accountability, and creative
              experiments to help clients rebuild trust with themselves — not because they are
              broken, but because they are stretched thin. His work spans private coaching,
              structured programs (Identity Reformation, Defining Manhood, Relationship
              Intelligence, and more), and two published books, &ldquo;Concealed Redemption&rdquo;
              and &ldquo;The Great Deception.&rdquo;
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold text-navy">Credentials</h2>
            <ul className="mt-3 space-y-2">
              {credentials.map((c) => (
                <li key={c} className="text-navy-600">
                  &bull; {c}
                </li>
              ))}
            </ul>

            <h2 className="mt-10 font-heading text-xl font-semibold text-navy">Contact</h2>
            <div className="mt-3 flex flex-wrap gap-4">
              <Button href={WHATSAPP_URL} size="sm">
                WhatsApp
              </Button>
              <Button href={`mailto:${CONTACT_EMAIL}`} variant="outline" size="sm">
                {CONTACT_EMAIL}
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-14 text-sm text-navy-400">
          Professional photography and a downloadable media kit PDF are in production.
        </p>
      </div>
    </section>
  )
}
