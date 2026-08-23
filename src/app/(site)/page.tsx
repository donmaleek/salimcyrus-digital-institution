import { Hero } from '@/components/sections/home/Hero'
import { ServicesOverview } from '@/components/sections/home/ServicesOverview'
import { FeaturedContent } from '@/components/sections/home/FeaturedContent'
import { TransformativeResults } from '@/components/sections/home/TransformativeResults'
import { CtaSection } from '@/components/sections/home/CtaSection'

export default function Page() {
  return (
    <>
      <Hero />
      <ServicesOverview />
      <FeaturedContent />
      <TransformativeResults />
      <CtaSection />
    </>
  )
}
