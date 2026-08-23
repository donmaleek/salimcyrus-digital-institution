interface MobileNavProps {
  children?: React.ReactNode
  className?: string
}

export function MobileNav({ children, className }: MobileNavProps) {
  return <div className={className}>{children}</div>
}
