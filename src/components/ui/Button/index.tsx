import Link from 'next/link'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { Spinner } from '@/components/ui/Spinner'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-body font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:opacity-50 disabled:pointer-events-none'

const variants: Record<Variant, string> = {
  primary: 'bg-gold text-navy-900 hover:bg-gold-300',
  secondary: 'bg-navy text-cream hover:bg-navy-700',
  outline: 'border border-navy text-navy hover:bg-navy hover:text-cream',
  ghost: 'text-navy hover:bg-navy-50',
}

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

interface CommonProps {
  children: ReactNode
  variant?: Variant
  size?: Size
  className?: string
  loading?: boolean
}

interface ButtonAsButton extends CommonProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  href?: undefined
}

interface ButtonAsLink extends CommonProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> {
  href: string
}

type ButtonProps = ButtonAsButton | ButtonAsLink

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  href,
  ...props
}: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`

  if (href) {
    return (
      <Link href={href} className={classes} {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </Link>
    )
  }

  return (
    <button
      className={classes}
      disabled={loading || (props as ButtonHTMLAttributes<HTMLButtonElement>).disabled}
      aria-busy={loading}
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {loading && <Spinner size={16} />}
      {children}
    </button>
  )
}
