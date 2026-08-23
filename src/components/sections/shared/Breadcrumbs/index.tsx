interface BreadcrumbsProps {
  children?: React.ReactNode
  className?: string
}

export function Breadcrumbs({ children, className }: BreadcrumbsProps) {
  return <div className={className}>{children}</div>
}
