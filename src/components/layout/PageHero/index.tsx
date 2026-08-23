import type { ReactNode } from 'react'
import Image from 'next/image'

interface PageHeroProps {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  align?: 'left' | 'center'
  image?: { src: string; alt: string; width: number; height: number }
  children?: ReactNode
}

export function PageHero({ eyebrow, title, description, actions, align = 'left', image, children }: PageHeroProps) {
  const isCenter = align === 'center' && !image

  return (
    <section className="relative overflow-hidden bg-navy">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 top-1/2 h-[560px] w-[560px] -translate-y-1/2 rounded-full bg-gold/20 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-[360px] w-[360px] rounded-full bg-gold/10 blur-3xl" />
      </div>

      <div
        className={`relative mx-auto max-w-content px-6 py-20 sm:py-24 ${
          image ? 'grid items-center gap-10 lg:grid-cols-[1fr_auto]' : ''
        }`}
      >
        <div className={isCenter ? 'mx-auto text-center' : ''}>
          <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold">
            {eyebrow}
          </p>
          <h1
            className={`mt-4 max-w-3xl font-heading text-4xl font-bold leading-tight text-cream sm:text-5xl lg:text-6xl ${
              isCenter ? 'mx-auto' : ''
            }`}
          >
            {title}
          </h1>
          {description && (
            <p
              className={`mt-6 max-w-2xl text-lg leading-relaxed text-cream/80 sm:text-xl ${
                isCenter ? 'mx-auto' : ''
              }`}
            >
              {description}
            </p>
          )}
          {actions && (
            <div className={`mt-9 flex flex-wrap gap-4 ${isCenter ? 'justify-center' : ''}`}>{actions}</div>
          )}
          {children}
        </div>

        {image && (
          <div className="relative mx-auto w-full max-w-[260px] overflow-hidden rounded-3xl bg-navy-800/50 ring-1 ring-white/10 lg:mx-0">
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </div>
    </section>
  )
}
