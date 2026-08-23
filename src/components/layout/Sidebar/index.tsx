interface SidebarProps {
  children?: React.ReactNode
  className?: string
}

export function Sidebar({ children, className }: SidebarProps) {
  return <div className={className}>{children}</div>
}
