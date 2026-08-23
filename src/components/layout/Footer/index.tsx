import Link from 'next/link'
import Image from 'next/image'
import { FooterLinks } from './FooterLinks'
import { NewsletterSignup } from './NewsletterSignup'
import { SocialIcon } from '@/components/ui/SocialIcon'
import { CONTACT_EMAIL, WHATSAPP_URL } from '@/lib/utils/constants'

export function Footer() {
  return (
    <footer className="bg-navy text-cream">
      <div className="mx-auto max-w-content px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Image
              src="/images/salim/signature-logo.webp"
              alt="Salim Cyrus"
              width={160}
              height={107}
              className="h-14 w-auto"
            />
            <p className="mt-3 max-w-sm text-sm text-cream/70">
              Relationship Coach | Speaker | Author | Kingdom Strategist. Empowering minds.
              Reforming hearts. Restoring purpose through truth and wisdom.
            </p>
            <div className="mt-4 flex flex-col gap-1 text-sm text-cream/80">
              <Link href={WHATSAPP_URL} className="hover:text-gold">
                WhatsApp
              </Link>
              <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-gold">
                {CONTACT_EMAIL}
              </a>
            </div>
            <div className="mt-4 flex gap-3">
              <SocialIcon name="whatsapp" href={WHATSAPP_URL} label="Chat on WhatsApp" />
              <SocialIcon name="email" href={`mailto:${CONTACT_EMAIL}`} label="Send an email" />
            </div>
            <div className="mt-8">
              <NewsletterSignup />
            </div>
          </div>
          <FooterLinks />
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-cream/10 pt-8 text-xs text-cream/50 sm:flex-row sm:items-center">
          <p>&copy; {new Date().getFullYear()} Salim Cyrus. All rights reserved.</p>
          <p>Halisi Hub Connect — Awakening wisdom. Restoring identity. Cultivating purposeful living.</p>
        </div>
      </div>
    </footer>
  )
}
