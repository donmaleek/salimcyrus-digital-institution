import Image from 'next/image'
import Link from 'next/link'
import { FooterLinks } from './FooterLinks'
import { NewsletterSignup } from './NewsletterSignup'
import { SocialIcon } from '@/components/ui/SocialIcon'
import { CONTACT_EMAIL, WHATSAPP_URL } from '@/lib/utils/constants'

export function Footer() {
  return (
    <footer
      className="relative isolate overflow-hidden border-t border-gold/30 bg-navy text-cream"
      data-testid="site-footer"
    >
      <Image
        src="/images/salim/footer-auditorium.webp"
        alt=""
        fill
        sizes="100vw"
        className="-z-20 object-cover object-[72%_center] sm:object-center"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(5,16,31,0.98)_0%,rgba(5,16,31,0.93)_48%,rgba(5,16,31,0.68)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(5,16,31,0.15)_0%,rgba(5,16,31,0.72)_100%)]" />

      <div className="mx-auto max-w-content px-6 py-16 sm:py-20 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.5fr)] lg:gap-20">
          <div>
            <p className="mb-5 font-heading text-[11px] font-semibold uppercase tracking-[0.32em] text-gold">
              Wisdom for purposeful living
            </p>
            <span className="font-signature text-5xl leading-none text-gold sm:text-6xl">
              Salim Cyrus
            </span>
            <p className="mt-5 max-w-md text-sm leading-7 text-cream/75 sm:text-base">
              Relationship Coach | Speaker | Author | Kingdom Strategist. Empowering minds.
              Reforming hearts. Restoring purpose through truth and wisdom.
            </p>
            <div className="mt-6 flex flex-col gap-2 text-sm text-cream/80">
              <Link href={WHATSAPP_URL} className="w-fit transition-colors hover:text-gold">
                WhatsApp
              </Link>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="w-fit transition-colors hover:text-gold"
              >
                {CONTACT_EMAIL}
              </a>
            </div>
            <div className="mt-5 flex gap-3">
              <SocialIcon name="whatsapp" href={WHATSAPP_URL} label="Chat on WhatsApp" />
              <SocialIcon name="email" href={`mailto:${CONTACT_EMAIL}`} label="Send an email" />
            </div>
            <div className="mt-9 border-t border-cream/10 pt-8">
              <NewsletterSignup />
            </div>
          </div>
          <FooterLinks />
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-cream/15 pt-8 text-xs leading-5 text-cream/55 sm:flex-row sm:items-center lg:mt-20">
          <p>&copy; {new Date().getFullYear()} Salim Cyrus. All rights reserved.</p>
          <p>Halisi Hub Connect — Awakening wisdom. Restoring identity. Cultivating purposeful living.</p>
        </div>
      </div>
    </footer>
  )
}
