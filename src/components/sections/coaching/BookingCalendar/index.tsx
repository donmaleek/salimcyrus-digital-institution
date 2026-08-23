interface BookingCalendarProps {
  children?: React.ReactNode
  className?: string
}

export function BookingCalendar({ children, className }: BookingCalendarProps) {
  return <div className={className}>{children}</div>
}
