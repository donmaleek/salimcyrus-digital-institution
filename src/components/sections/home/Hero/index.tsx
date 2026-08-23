interface HeroProps {
  children?: React.ReactNode
  className?: string
}

export function Hero({ children, className }: HeroProps) {
  return <div className={className}>{children}</div>
}
