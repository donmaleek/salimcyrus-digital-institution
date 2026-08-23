import { FooterLinks } from './FooterLinks'
import { NewsletterSignup } from './NewsletterSignup'

export function Footer() {
  return (
    <footer className="bg-navy text-cream">
      <div className="mx-auto max-w-content px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <span className="font-heading text-2xl font-bold">Salim Cyrus</span>
            <p className="mt-3 max-w-sm text-sm text-cream/70">
              Relationship Coach | Speaker | Author | Kingdom Strategist. Empowering minds.
              Reforming hearts. Restoring purpose through truth and wisdom.
            </p>
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
