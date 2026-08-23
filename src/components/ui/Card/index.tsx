import Link from 'next/link'

interface CardProps {
  children: React.ReactNode
  href?: string
  className?: string
}

const base = 'rounded-2xl border border-navy-100 bg-white p-6 transition-shadow'

export function Card({ children, href, className = '' }: CardProps) {
  if (href) {
    return (
      <Link href={href} className={`${base} hover:shadow-lg ${className}`}>
        {children}
      </Link>
    )
  }

  return <div className={`${base} ${className}`}>{children}</div>
}
