interface FrameworksDisplayProps {
  children?: React.ReactNode
  className?: string
}

export function FrameworksDisplay({ children, className }: FrameworksDisplayProps) {
  return <div className={className}>{children}</div>
}
