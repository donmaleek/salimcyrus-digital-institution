import Image from 'next/image'

/**
 * A flat cover image styled to read as a physical book: layered offset
 * shadows simulate a stack of page edges on the right, plus a soft drop
 * shadow for depth, matching how Amazon/Kindle product pages present a
 * cover rather than showing a bare rectangular image.
 */
export function BookCover({
  src,
  alt,
  priority,
  sizes,
}: {
  src: string
  alt: string
  priority?: boolean
  sizes?: string
}) {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2px] bg-navy-50 shadow-[-3px_0_0_0_#D7DEE8,-6px_0_0_0_#AFBED1,-7px_1px_0_0_#869DBA,0_20px_35px_-12px_rgba(15,27,45,0.45)]">
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? '(max-width: 640px) 60vw, (max-width: 1024px) 30vw, 280px'}
        className="object-cover"
        priority={priority}
      />
    </div>
  )
}
