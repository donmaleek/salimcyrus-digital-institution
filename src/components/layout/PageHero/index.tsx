import type { ReactNode } from 'react'
import Image from 'next/image'
import { ScrollCue } from '@/components/ui/ScrollCue'
import { getHeroVisual } from '@/lib/data/hero-visuals'

interface PageHeroProps {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  align?: 'left' | 'center'
  image?: { src: string; alt: string; width: number; height: number }
  children?: ReactNode
}

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  align = 'left',
  children,
}: PageHeroProps) {
  const isCenter = align === 'center'
  const visual = getHeroVisual(eyebrow)

  return (
    <section
      className="relative isolate flex min-h-[620px] overflow-hidden bg-navy sm:min-h-[660px] lg:min-h-[700px]"
      data-testid="page-hero"
    >
      <Image
        src={visual}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[68%_center] sm:object-[64%_center] lg:object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy/30 via-navy/20 to-navy/95 lg:bg-gradient-to-r lg:from-navy/95 lg:via-navy/65 lg:to-navy/10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,27,45,0.35)_0%,transparent_25%)]" />

      <div className="relative mx-auto flex w-full max-w-content items-center px-6 pb-20 pt-28 sm:pb-24 lg:px-8 lg:pt-24">
        <div
          className={isCenter ? 'mx-auto max-w-4xl text-center' : 'max-w-3xl'}
        >
          <p className="font-body text-sm font-semibold uppercase tracking-[0.24em] text-gold sm:text-base">
            {eyebrow}
          </p>
          <h1 className="mt-4 font-heading text-5xl font-bold leading-[0.98] text-cream sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          {description && (
            <p
              className={`mt-6 max-w-2xl text-lg leading-relaxed text-cream/90 sm:text-xl ${
                isCenter ? 'mx-auto' : ''
              }`}
            >
              {description}
            </p>
          )}
          {actions && (
            <div
              className={`mt-9 flex flex-wrap gap-4 ${isCenter ? 'justify-center' : ''}`}
            >
              {actions}
            </div>
          )}
          {children}
        </div>
      </div>
      <ScrollCue />
    </section>
  )
}
