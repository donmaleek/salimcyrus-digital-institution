import type { Metadata } from 'next'
import { PageHero } from '@/components/layout/PageHero'
import { CONTACT_EMAIL } from '@/lib/utils/constants'

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy',
}

export default function RefundPolicyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Refund & Cancellation Policy"
        description="What to expect if plans change after a coaching session, program, membership, or digital product is purchased."
      />
      <section className="bg-cream">
        <div className="mx-auto max-w-content px-6 py-20">
          <p className="mt-2 text-sm text-navy-400">
            Draft — review with a qualified lawyer before publishing, and confirm these
            terms match what Paystack processes for chargebacks/disputes.
          </p>

          <div className="prose prose-navy mt-10 max-w-none space-y-6 text-navy-600">
            <h2 className="font-heading text-xl font-semibold text-navy">
              Coaching Sessions
            </h2>
            <p>
              A scheduled session can be rescheduled at no cost with at least 24 hours&apos;
              notice, using the contact details provided at booking. Rescheduling with
              less than 24 hours&apos; notice, or not attending, forfeits that session.
            </p>
            <p>
              A full refund is available if requested before the session is scheduled or
              held. Once a session has taken place, it is non-refundable.
            </p>

            <h2 className="font-heading text-xl font-semibold text-navy">
              Multi-Session Coaching Packages
            </h2>
            <p>
              Refunds for a package are prorated: sessions already completed are
              deducted at their standalone price, and the remainder is refunded.
              Packages are non-refundable once every session has been used.
            </p>

            <h2 className="font-heading text-xl font-semibold text-navy">
              Programs, Masterclasses & Memberships
            </h2>
            <p>
              A full refund is available within 7 days of purchase, provided less than
              20% of the program content has been accessed. Beyond that window, or once
              a majority of the material has been accessed, the purchase is
              non-refundable. Monthly memberships can be cancelled at any time to stop
              future billing; the current billing period is not refunded.
            </p>

            <h2 className="font-heading text-xl font-semibold text-navy">
              Books & Digital Downloads
            </h2>
            <p>
              Digital products (books, guides, downloads) are non-refundable once
              delivered, except where the file is defective or materially different
              from its description.
            </p>

            <h2 className="font-heading text-xl font-semibold text-navy">
              How to Request a Refund or Reschedule
            </h2>
            <p>
              Contact <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with your
              payment reference and the reason for the request. Approved refunds are
              returned to the original payment method through Paystack, typically
              within 5–10 business days depending on your bank or provider.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
