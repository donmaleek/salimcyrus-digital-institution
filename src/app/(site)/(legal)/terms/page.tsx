import type { Metadata } from 'next'
import { PageHero } from '@/components/layout/PageHero'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
}

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms & Conditions"
        description="The terms governing use of this website, services, programs, and intellectual property."
      />
      <section className="bg-cream">
        <div className="mx-auto max-w-content px-6 py-20">
          <p className="mt-2 text-sm text-navy-400">
            Draft — review with a qualified lawyer before publishing.
          </p>

          <div className="prose prose-navy mt-10 max-w-none space-y-6 text-navy-600">
            <h2 className="font-heading text-xl font-semibold text-navy">
              Use of This Website
            </h2>
            <p>
              By using SalimCyrus.com, you agree to these terms. Content is
              provided for informational and educational purposes.
            </p>
            <h2 className="font-heading text-xl font-semibold text-navy">
              Purchases
            </h2>
            <p>
              Coaching sessions, courses, masterclasses, memberships, and
              digital products are sold subject to the pricing and descriptions
              shown at the time of purchase.
            </p>
            <h2 className="font-heading text-xl font-semibold text-navy">
              Intellectual Property
            </h2>
            <p>
              All frameworks, articles, courses, and media on this site are the
              intellectual property of Salim Cyrus / Halisi Hub Connect and may
              not be reproduced without permission.
            </p>
            <h2 className="font-heading text-xl font-semibold text-navy">
              Limitation of Liability
            </h2>
            <p>
              Coaching and educational content are provided as-is and do not
              guarantee specific outcomes.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
