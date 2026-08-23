interface SpeakingEnquiryFormProps {
  children?: React.ReactNode
  className?: string
}

export function SpeakingEnquiryForm({ children, className }: SpeakingEnquiryFormProps) {
  return <div className={className}>{children}</div>
}
