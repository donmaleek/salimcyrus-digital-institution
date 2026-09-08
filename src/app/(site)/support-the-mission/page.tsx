import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/layout/PageHero'
import { DonationPaymentOptions } from '@/components/payments/DonationPaymentOptions'
import { PayPalDonationReturn } from '@/components/payments/PayPalDonationReturn'
import { TUKO_FEATURE_URL } from '@/lib/utils/constants'

export const metadata: Metadata = {
  title: 'Support the Mission',
  description:
    'Support Halisi Hub Connect mentorship, community initiatives, and free educational resources through Paystack, M-Pesa Paybill, or PayPal.',
}

const impactAreas = [
  {
    title: 'Mentorship',
    description:
      'Create structured spaces where boys and young men can develop identity, discipline, and responsible leadership.',
  },
  {
    title: 'Community access',
    description:
      'Take practical training and support to schools and communities where cost would otherwise block participation.',
  },
  {
    title: 'Free resources',
    description:
      'Produce guides, conversations, and learning tools that remain freely available to people seeking a place to begin.',
  },
]

export default function SupportTheMissionPage({
  searchParams,
}: {
  searchParams?: { payment?: string; token?: string }
}) {
  return (
    <>
      <PageHero
        eyebrow="Support the Mission"
        title="Help Halisi Hub Connect Reach Further"
        description="Fund mentorship, community initiatives, and free resources for people who could not otherwise access them. Choose the payment method that works best for you."
        actions={
          <Button href="#payment-options" size="lg">
            Choose a Payment Method
          </Button>
        }
      />

      <main data-testid="support-the-mission-content">
        {searchParams?.payment === 'returned' && searchParams?.token && (
          <Suspense>
            <PayPalDonationReturn />
          </Suspense>
        )}
        {searchParams?.payment === 'returned' && !searchParams?.token && (
          <div
            className="bg-emerald-50 px-6 py-4 text-center text-sm font-semibold leading-6 text-emerald-900"
            role="status"
          >
            You have returned from Paystack. Keep your transaction reference
            while payment confirmation is processed.
          </div>
        )}
        <section className="bg-cream" aria-labelledby="impact-heading">
          <div className="mx-auto max-w-content px-6 py-16 sm:py-24">
            <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-600">
                  What Your Support Moves
                </p>
                <h2
                  id="impact-heading"
                  className="mt-3 font-heading text-4xl font-bold leading-tight text-navy"
                >
                  Give toward visible, practical work
                </h2>
              </div>
              <div className="grid gap-6 sm:grid-cols-3">
                {impactAreas.map((area) => (
                  <article
                    key={area.title}
                    className="border-t border-gold-400 pt-5"
                  >
                    <h3 className="font-heading text-xl font-bold text-navy">
                      {area.title}
                    </h3>
                    <p className="mt-3 leading-7 text-navy-600">
                      {area.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="payment-options"
          className="scroll-mt-24 bg-navy-50"
          aria-labelledby="payment-options-heading"
        >
          <div className="mx-auto max-w-content px-6 py-16 sm:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-600">
                Secure Ways to Give
              </p>
              <h2
                id="payment-options-heading"
                className="mt-3 font-heading text-4xl font-bold text-navy"
              >
                Paystack, M-Pesa, or PayPal
              </h2>
              <p className="mt-5 text-lg leading-8 text-navy-600">
                Paystack keeps card and mobile-money details on its secure
                checkout. Manual M-Pesa and PayPal instructions are shown
                clearly for direct support.
              </p>
            </div>
            <div className="mt-12">
              <DonationPaymentOptions />
            </div>
          </div>
        </section>

        <section
          className="bg-white"
          aria-labelledby="independent-feature-heading"
        >
          <div className="mx-auto grid max-w-content gap-10 px-6 py-16 sm:py-24 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:gap-20">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-600">
                Independent Feature
              </p>
              <p className="mt-4 font-heading text-7xl font-bold leading-none text-navy-100">
                TUKO
              </p>
            </div>
            <div>
              <h2
                id="independent-feature-heading"
                className="font-heading text-3xl font-bold leading-tight text-navy sm:text-4xl"
              >
                Redefining manhood by taking boy-child challenges head-on
              </h2>
              <p className="mt-5 text-lg leading-8 text-navy-600">
                Tuko.co.ke profiled Salim Cyrus’s work mentoring boys and young
                men, including outreach in schools and communities such as
                Kibera and Mukuru Kwa Njenga.
              </p>
              <p className="mt-3 text-sm font-semibold uppercase tracking-[0.14em] text-navy-400">
                Published 2 March 2022
              </p>
              <Button
                href={TUKO_FEATURE_URL}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
                className="mt-7"
              >
                Read the Tuko Feature
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-gold-50">
          <div className="mx-auto max-w-3xl px-6 py-16 text-center sm:py-20">
            <h2 className="font-heading text-3xl font-bold text-navy">
              Need payment help?
            </h2>
            <p className="mt-4 text-lg leading-8 text-navy-600">
              Keep your payment confirmation or transaction reference. The team
              can use it to help reconcile your support.
            </p>
            <Button href="/contact" variant="outline" className="mt-7">
              Contact the Team
            </Button>
          </div>
        </section>
      </main>
    </>
  )
}
