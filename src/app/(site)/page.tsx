import { Hero } from '@/components/sections/home/Hero'
import { ServicesOverview } from '@/components/sections/home/ServicesOverview'
import { FeaturedContent } from '@/components/sections/home/FeaturedContent'
import { TransformativeResults } from '@/components/sections/home/TransformativeResults'
import { CtaSection } from '@/components/sections/home/CtaSection'
import { InstitutionalOverview } from '@/components/sections/home/InstitutionalOverview'

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
