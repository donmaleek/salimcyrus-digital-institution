interface BadgeProps {
  children: React.ReactNode
  variant?: 'gold' | 'navy' | 'outline'
  className?: string
}

const variants = {
  gold: 'bg-gold-50 text-gold-500',
  navy: 'bg-navy-50 text-navy-600',
  outline: 'border border-navy-200 text-navy-700',
}

export function Badge({ children, variant = 'gold', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
