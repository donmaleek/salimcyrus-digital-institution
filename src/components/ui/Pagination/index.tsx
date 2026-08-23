interface PaginationProps {
  children?: React.ReactNode
  className?: string
}

export function Pagination({ children, className }: PaginationProps) {
  return <div className={className}>{children}</div>
}
