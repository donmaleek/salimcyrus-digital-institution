import type { Metadata } from 'next'
import { PageHero } from '@/components/layout/PageHero'
import { ParentalGuidanceSchoolRequestForm } from '@/components/forms/ParentalGuidanceSchoolRequestForm'

export const metadata: Metadata = {
  title: 'School & Organization Package',
  description: 'Workshops, group education, and tailored Parental Guidance resources for schools and organizations.',
}

export default function ParentalGuidanceSchoolPage() {
  return (
    <>
      <PageHero
        eyebrow="Parental Guidance"
        title="For Schools and Organizations"
        description="Bring the Parental Guidance curriculum to your parent community: workshops, group education sessions, and resources tailored to your group."
      />
      <section className="bg-cream">
        <div className="mx-auto max-w-2xl px-6 py-16">
          <div className="border border-navy-100 bg-white p-6 shadow-sm sm:p-8">
            <ParentalGuidanceSchoolRequestForm />
          </div>
        </div>
      </section>
    </>
  )
}
