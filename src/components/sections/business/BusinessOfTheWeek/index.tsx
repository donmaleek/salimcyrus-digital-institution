interface BusinessOfTheWeekProps {
  children?: React.ReactNode
  className?: string
}

export function BusinessOfTheWeek({ children, className }: BusinessOfTheWeekProps) {
  return <div className={className}>{children}</div>
}
