interface TransformativeResultsProps {
  children?: React.ReactNode
  className?: string
}

export function TransformativeResults({ children, className }: TransformativeResultsProps) {
  return <div className={className}>{children}</div>
}
