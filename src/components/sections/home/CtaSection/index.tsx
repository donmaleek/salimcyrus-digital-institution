interface CtaSectionProps {
  children?: React.ReactNode
  className?: string
}

export function CtaSection({ children, className }: CtaSectionProps) {
  return <div className={className}>{children}</div>
}
