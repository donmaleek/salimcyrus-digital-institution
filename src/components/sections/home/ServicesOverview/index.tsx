interface ServicesOverviewProps {
  children?: React.ReactNode
  className?: string
}

export function ServicesOverview({ children, className }: ServicesOverviewProps) {
  return <div className={className}>{children}</div>
}
