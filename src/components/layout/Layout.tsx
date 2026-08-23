interface LayoutProps {
  children?: React.ReactNode
  className?: string
}

export function Layout({ children, className }: LayoutProps) {
  return <div className={className}>{children}</div>
}
