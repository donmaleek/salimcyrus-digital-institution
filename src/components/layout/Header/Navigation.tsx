interface NavigationProps {
  children?: React.ReactNode
  className?: string
}

export function Navigation({ children, className }: NavigationProps) {
  return <div className={className}>{children}</div>
}
