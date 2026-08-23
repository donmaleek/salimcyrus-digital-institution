interface SpinnerProps {
  children?: React.ReactNode
  className?: string
}

export function Spinner({ children, className }: SpinnerProps) {
  return <div className={className}>{children}</div>
}
