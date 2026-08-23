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
      className="relative isolate flex h-[min(760px,100svh)] min-h-[680px] overflow-hidden bg-navy"
      data-testid="page-hero"
    >
      <Image
        src={visual}
        alt=""
        fill
        sizes="100vw"
        aria-hidden="true"
        className="scale-105 object-cover object-center opacity-45 blur-md"
      />
      <div className="absolute inset-x-0 top-16 aspect-video sm:top-20 lg:inset-0 lg:aspect-auto">
        <Image
          src={visual}
          alt=""
          fill
          priority
          sizes="100vw"
          data-testid="page-hero-full-image"
          className="object-contain object-center"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-navy/5 via-navy/20 to-navy lg:bg-gradient-to-r lg:from-navy/95 lg:via-navy/55 lg:to-navy/15" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,27,45,0.35)_0%,transparent_25%)]" />

      <div className="relative mx-auto flex w-full max-w-content items-end px-6 pb-24 pt-28 sm:pb-24 sm:pt-28 lg:items-center lg:px-8 lg:pt-24">
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
