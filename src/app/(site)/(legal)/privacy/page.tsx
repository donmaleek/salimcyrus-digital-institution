import type { Metadata } from 'next'
import { PageHero } from '@/components/layout/PageHero'

export const metadata: Metadata = {
  title: 'Privacy Policy',
}

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        description="How personal information is collected, used, protected, and controlled."
      />
      <section className="bg-cream">
        <div className="mx-auto max-w-content px-6 py-20">
          <p className="mt-2 text-sm text-navy-400">
            Draft — review with a qualified lawyer before publishing, especially
            regarding payment and Kenyan data protection (ODPC) requirements.
          </p>

          <div className="prose prose-navy mt-10 max-w-none space-y-6 text-navy-600">
            <p>
              This Privacy Policy explains what information SalimCyrus.com
              collects, how it is used, and the choices available to you.
            </p>
            <h2 className="font-heading text-xl font-semibold text-navy">
              Information We Collect
            </h2>
            <p>
              Contact details submitted through forms (name, email, message);
              newsletter subscription email addresses; payment information
              processed by our payment providers (Paystack, Pesapal) — we do not
              store full card details; and standard website analytics data.
            </p>
            <h2 className="font-heading text-xl font-semibold text-navy">
              How We Use Information
            </h2>
            <p>
              To respond to enquiries, deliver purchased products and coaching
              services, send the newsletter to subscribers, and improve the
              website.
            </p>
            <h2 className="font-heading text-xl font-semibold text-navy">
              Third Parties
            </h2>
            <p>
              We use third-party services for payments, email delivery,
              community hosting, and analytics. Each is bound by its own privacy
              terms.
            </p>
            <h2 className="font-heading text-xl font-semibold text-navy">
              Your Rights
            </h2>
            <p>
              You may request access to, correction of, or deletion of your
              personal data by contacting us.
            </p>
            <h2 className="font-heading text-xl font-semibold text-navy">
              Contact
            </h2>
            <p>Questions about this policy can be sent via the Contact page.</p>
          </div>
        </div>
      </section>
    </>
  )
}
