import Link from 'next/link'

type IconName = 'whatsapp' | 'email'

const icons: Record<IconName, React.ReactNode> = {
  whatsapp: (
    <path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4C7.6 4 4 7.6 4 12.05c0 1.42.37 2.8 1.08 4.02L4 20l4.05-1.06a8.03 8.03 0 0 0 4 1.02h.01c4.44 0 8.05-3.6 8.05-8.05 0-2.15-.84-4.17-2.36-5.7Zm-5.55 12.4h-.01a6.7 6.7 0 0 1-3.4-.93l-.24-.15-2.4.63.64-2.34-.16-.24a6.7 6.7 0 0 1-1.02-3.56 6.72 6.72 0 0 1 6.7-6.7 6.68 6.68 0 0 1 4.74 1.97 6.65 6.65 0 0 1 1.96 4.73c0 3.7-3.02 6.7-6.7 6.7Zm3.68-5.02c-.2-.1-1.18-.58-1.36-.65-.18-.07-.32-.1-.45.1-.13.2-.51.65-.63.78-.12.13-.23.15-.43.05-.2-.1-.85-.32-1.62-1.02a6.08 6.08 0 0 1-1.12-1.4c-.12-.2 0-.3.09-.4.09-.1.2-.24.3-.36.1-.12.13-.2.2-.33.07-.13.03-.25-.02-.35-.05-.1-.45-1.1-.62-1.5-.16-.4-.33-.34-.45-.34-.12 0-.25-.02-.38-.02-.13 0-.35.05-.53.25-.18.2-.7.68-.7 1.67 0 .98.72 1.93.82 2.06.1.13 1.4 2.15 3.4 3 .48.2.85.33 1.14.42.48.15.91.13 1.26.08.38-.06 1.18-.48 1.35-.94.17-.47.17-.86.12-.95-.05-.09-.18-.14-.38-.24Z" />
  ),
  email: (
    <path d="M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm1.4 1.5 6.1 4.6a1 1 0 0 0 1 0l6.1-4.6H5.4ZM19 8.6l-6.4 4.8a2 2 0 0 1-2.2 0L4 8.6V16h15V8.6Z" />
  ),
}

export function SocialIcon({
  name,
  href,
  label,
  className = '',
}: {
  name: IconName
  href: string
  label: string
  className?: string
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-cream/20 text-cream/80 transition-colors hover:border-gold hover:text-gold ${className}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        {icons[name]}
      </svg>
    </Link>
  )
}
