interface HeaderProps {
  children?: React.ReactNode
  className?: string
}

export function Header({ children, className }: HeaderProps) {
  return <div className={className}>{children}</div>
}
