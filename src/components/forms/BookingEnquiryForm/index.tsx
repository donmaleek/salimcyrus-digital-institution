interface BookingEnquiryFormProps {
  children?: React.ReactNode
  className?: string
}

export function BookingEnquiryForm({ children, className }: BookingEnquiryFormProps) {
  return <div className={className}>{children}</div>
}
