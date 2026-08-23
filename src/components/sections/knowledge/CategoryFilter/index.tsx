interface CategoryFilterProps {
  children?: React.ReactNode
  className?: string
}

export function CategoryFilter({ children, className }: CategoryFilterProps) {
  return <div className={className}>{children}</div>
}
