interface BadgeProps {
  children?: React.ReactNode
  className?: string
}

export function Badge({ children, className }: BadgeProps) {
  return <div className={className}>{children}</div>
}
