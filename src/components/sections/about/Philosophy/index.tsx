interface PhilosophyProps {
  children?: React.ReactNode
  className?: string
}

export function Philosophy({ children, className }: PhilosophyProps) {
  return <div className={className}>{children}</div>
}
