import { Hero } from '@/components/sections/home/Hero'
import { ServicesOverview } from '@/components/sections/home/ServicesOverview'
import { FeaturedContent } from '@/components/sections/home/FeaturedContent'
import { TransformativeResults } from '@/components/sections/home/TransformativeResults'
import { CtaSection } from '@/components/sections/home/CtaSection'
import { InstitutionalOverview } from '@/components/sections/home/InstitutionalOverview'

// A book Salim uploads through the admin dashboard should show up on the
// homepage without needing a redeploy; ISR picks it up within a minute,
// same as the /books catalog page.
export const revalidate = 60

export default function Page() {
  return (
    <>
      <Hero />
      <InstitutionalOverview />
      <ServicesOverview />
      <FeaturedContent />
      <TransformativeResults />
      <CtaSection />
    </>
  )
}
