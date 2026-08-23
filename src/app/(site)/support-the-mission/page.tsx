import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/layout/PageHero'

export const metadata: Metadata = {
  title: 'Support the Mission',
  description: 'Support Halisi Hub Connect initiatives.',
}

export default function SupportTheMissionPage() {
  return (
    <>
      <PageHero
        eyebrow="Support the Mission"
        title="Help Halisi Hub Connect Reach Further"
        description="Fund mentorship, community initiatives, and free resources for people who could not otherwise access them."
      />
      <section className="bg-cream">
        <div className="mx-auto max-w-content px-6 py-20 text-center">
          <Button href="/contact" size="lg" className="mt-10">
            Give to the Mission
          </Button>
        </div>
      </section>
    </>
  )
}
