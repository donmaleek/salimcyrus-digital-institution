interface BookingManagerProps {
  children?: React.ReactNode
  className?: string
}

export function BookingManager({ children, className }: BookingManagerProps) {
  return <div className={className}>{children}</div>
}
