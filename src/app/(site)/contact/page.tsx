import type { Metadata } from 'next'
import { ContactForm } from '@/components/forms/ContactForm'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageHero } from '@/components/layout/PageHero'
import { CONTACT_EMAIL, WHATSAPP_URL } from '@/lib/utils/constants'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Pathways to engage with Salim Cyrus and Halisi Hub Connect.',
}

const pathways = [
  { label: 'I want coaching', action: 'Book a session', href: '/work-with-salim/coaching' },
  { label: 'I want to invite Salim to speak', action: 'Speaking enquiry', href: '/work-with-salim/speaking' },
  { label: 'I want to join Halisi Hub Connect', action: 'Membership', href: '/halisi-hub-connect/community' },
  { label: 'I have a business enquiry', action: 'Business contact', href: '/work-with-salim/consulting' },
  { label: 'I want to support the mission', action: 'Support page', href: '/support-the-mission' },
  { label: 'Media enquiry', action: 'Press kit', href: '/media/press-kit' },
]

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Calm Clarity for Serious People"
        description="I don't coach for hype. I coach for decisions. Tell me what you're holding and we build the system that returns you to yourself."
        actions={
          <>
            <Button href={WHATSAPP_URL} size="lg">
              Message on WhatsApp
            </Button>
            <Button href={`mailto:${CONTACT_EMAIL}`} variant="outline-inverse" size="lg">
              {CONTACT_EMAIL}
            </Button>
          </>
        }
      />

      <section className="bg-navy-50">
        <div className="mx-auto max-w-content px-6 py-16">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pathways.map((pathway) => (
              <Card key={pathway.href} href={pathway.href}>
                <p className="font-medium text-navy">{pathway.label}</p>
                <p className="mt-1 text-sm font-semibold text-gold-500">{pathway.action} &rarr;</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto max-w-content px-6 py-16">
          <h2 className="font-heading text-2xl font-bold text-navy">General Message</h2>
          <div className="mt-8 max-w-xl rounded-2xl border border-navy-100 bg-white p-8">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  )
}
