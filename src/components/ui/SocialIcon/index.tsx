import Link from 'next/link'

type IconName =
  'whatsapp' | 'email' | 'linkedin' | 'tiktok' | 'x' | 'instagram' | 'facebook'

const icons: Record<IconName, React.ReactNode> = {
  whatsapp: (
    <path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4C7.6 4 4 7.6 4 12.05c0 1.42.37 2.8 1.08 4.02L4 20l4.05-1.06a8.03 8.03 0 0 0 4 1.02h.01c4.44 0 8.05-3.6 8.05-8.05 0-2.15-.84-4.17-2.36-5.7Zm-5.55 12.4h-.01a6.7 6.7 0 0 1-3.4-.93l-.24-.15-2.4.63.64-2.34-.16-.24a6.7 6.7 0 0 1-1.02-3.56 6.72 6.72 0 0 1 6.7-6.7 6.68 6.68 0 0 1 4.74 1.97 6.65 6.65 0 0 1 1.96 4.73c0 3.7-3.02 6.7-6.7 6.7Zm3.68-5.02c-.2-.1-1.18-.58-1.36-.65-.18-.07-.32-.1-.45.1-.13.2-.51.65-.63.78-.12.13-.23.15-.43.05-.2-.1-.85-.32-1.62-1.02a6.08 6.08 0 0 1-1.12-1.4c-.12-.2 0-.3.09-.4.09-.1.2-.24.3-.36.1-.12.13-.2.2-.33.07-.13.03-.25-.02-.35-.05-.1-.45-1.1-.62-1.5-.16-.4-.33-.34-.45-.34-.12 0-.25-.02-.38-.02-.13 0-.35.05-.53.25-.18.2-.7.68-.7 1.67 0 .98.72 1.93.82 2.06.1.13 1.4 2.15 3.4 3 .48.2.85.33 1.14.42.48.15.91.13 1.26.08.38-.06 1.18-.48 1.35-.94.17-.47.17-.86.12-.95-.05-.09-.18-.14-.38-.24Z" />
  ),
  email: (
    <path d="M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm1.4 1.5 6.1 4.6a1 1 0 0 0 1 0l6.1-4.6H5.4ZM19 8.6l-6.4 4.8a2 2 0 0 1-2.2 0L4 8.6V16h15V8.6Z" />
  ),
  linkedin: (
    <path d="M6.5 8.25H3.25V20H6.5V8.25ZM4.88 3A1.88 1.88 0 1 0 4.88 6.75 1.88 1.88 0 0 0 4.88 3ZM20.75 13.56c0-3.54-1.89-5.19-4.42-5.19a3.82 3.82 0 0 0-3.46 1.9V8.25H9.62V20h3.25v-5.82c0-1.54.29-3.02 2.19-3.02 1.87 0 1.89 1.75 1.89 3.12V20h3.25l.55-6.44Z" />
  ),
  tiktok: (
    <path d="M16.6 3c.27 2.29 1.55 3.65 3.79 3.8v3.08a7.42 7.42 0 0 1-3.75-1.08v5.76a5.52 5.52 0 1 1-4.76-5.47v3.14a2.45 2.45 0 1 0 1.66 2.33V3h3.06Z" />
  ),
  x: (
    <path d="M4.4 3h4.88l3.78 5.05L17.52 3h2.08l-5.58 6.57L20.6 21h-4.88l-4.11-5.5L6.92 21H4.84l5.81-7.02L4.4 3Zm3.85 1.5H6.99l9.76 15h1.26l-9.76-15Z" />
  ),
  instagram: (
    <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm9.75 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
  ),
  facebook: (
    <path d="M14 8h3V4.5c-.52-.07-2.31-.22-4.05-.22C9.31 4.28 6.82 6.5 6.82 10.6V14H3v3.91h3.82V24h4.68v-6.09h3.88L16 14h-4.5v-3.01C11.5 9.86 11.8 8 14 8Z" />
  ),
}

export function SocialIcon({
  name,
  href,
  label,
  className = '',
  linked = true,
}: {
  name: IconName
  href: string
  label: string
  className?: string
  linked?: boolean
}) {
  const isExternal = href.startsWith('http')
  const icon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      {icons[name]}
    </svg>
  )
  const classes = `inline-flex h-9 w-9 items-center justify-center rounded-full border border-cream/20 text-cream/80 transition-colors hover:border-gold hover:text-gold ${className}`

  if (!linked) {
    return <span aria-hidden className={classes}>{icon}</span>
  }

  return (
    <Link
      href={href}
      aria-label={label}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className={classes}
    >
      {icon}
    </Link>
  )
}
