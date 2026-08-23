import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Disclaimers',
}

export default function DisclaimersPage() {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-content px-6 py-20">
        <h1 className="font-heading text-4xl font-bold text-navy">Disclaimers</h1>
        <p className="mt-2 text-sm text-navy-400">
          Draft — review with a qualified lawyer before publishing.
        </p>

        <div className="prose prose-navy mt-10 max-w-none space-y-6 text-navy-600">
          <h2 className="font-heading text-xl font-semibold text-navy">Coaching Disclaimer</h2>
          <p>
            Coaching provided by Salim Cyrus is not a substitute for licensed therapy, psychiatric
            care, or medical treatment. If you are in crisis, please contact a licensed
            professional or emergency services.
          </p>
          <h2 className="font-heading text-xl font-semibold text-navy">Business & Financial Content</h2>
          <p>
            Business, financial, and investment content on this site is educational and general
            in nature. It is not individualized financial, legal, or investment advice. Verify
            current financial, regulatory, or market information from authoritative sources
            before acting on it.
          </p>
          <h2 className="font-heading text-xl font-semibold text-navy">Results</h2>
          <p>
            Testimonials reflect individual experiences. Results are not guaranteed and vary by
            person.
          </p>
        </div>
      </div>
    </section>
  )
}
