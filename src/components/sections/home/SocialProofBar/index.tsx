import Image from 'next/image'

const mediaLogos = [
  {
    name: 'Disrupt Africa',
    src: '/images/media-logos/disrupt-africa.png',
    width: 500,
    height: 200,
  },
  {
    name: 'Entrepreneur',
    src: '/images/media-logos/entrepreneur.png',
    width: 500,
    height: 200,
  },
  { name: 'OWN', src: '/images/media-logos/own.png', width: 591, height: 355 },
  {
    name: 'Think Sales & Profit',
    src: '/images/media-logos/think-sales-profit.png',
    width: 591,
    height: 355,
  },
  {
    name: 'Forbes',
    src: '/images/media-logos/forbes.png',
    width: 500,
    height: 200,
  },
  {
    name: 'Goalcast',
    src: '/images/media-logos/goalcast.png',
    width: 500,
    height: 200,
  },
  { name: 'University of Nairobi', initials: 'UON' },
  { name: 'Amour Software Consultants', initials: 'ASC' },
  { name: 'Mount Kenya University', initials: 'MKU' },
]

function LogoGroup({ hidden = false }: { hidden?: boolean }) {
  return (
    <div
      className="flex shrink-0 items-center gap-10 px-5 sm:gap-14 sm:px-7"
      aria-hidden={hidden}
    >
      {mediaLogos.map((logo) => (
        <div
          key={logo.name}
          className="relative flex h-16 w-36 shrink-0 items-center justify-center sm:h-20 sm:w-44"
        >
          {'initials' in logo ? (
            <div
              className="flex items-center gap-2.5 text-white/90"
              role="img"
              aria-label={hidden ? undefined : logo.name}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/60 font-sans text-[11px] font-bold tracking-wide">
                {logo.initials}
              </span>
              <span className="max-w-24 font-serif text-sm font-semibold leading-tight sm:text-base">
                {logo.name}
              </span>
            </div>
          ) : (
            <Image
              src={logo.src}
              alt={hidden ? '' : logo.name}
              width={logo.width}
              height={logo.height}
              sizes="(min-width: 640px) 176px, 144px"
              className="max-h-14 w-full object-contain opacity-90 transition-opacity hover:opacity-100 sm:max-h-16"
            />
          )}
        </div>
      ))}
    </div>
  )
}

export function SocialProofBar() {
  return (
    <aside
      className="absolute inset-x-0 bottom-20 z-20 overflow-hidden border-y border-white/10 bg-black/45 py-1.5 backdrop-blur-sm sm:py-2 lg:bottom-[120px]"
      aria-label="Media recognition"
    >
      <h2 className="sr-only">As featured by</h2>
      <div className="media-logo-track flex w-max items-center">
        <LogoGroup />
        <LogoGroup hidden />
      </div>
    </aside>
  )
}
