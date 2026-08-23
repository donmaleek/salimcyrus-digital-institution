interface SearchBarProps {
  children?: React.ReactNode
  className?: string
}

export function SearchBar({ children, className }: SearchBarProps) {
  return <div className={className}>{children}</div>
}
