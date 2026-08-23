interface DashboardLayoutProps {
  children?: React.ReactNode
  className?: string
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  return <div className={className}>{children}</div>
}
