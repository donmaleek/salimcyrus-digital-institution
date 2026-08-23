interface ContactFormProps {
  children?: React.ReactNode
  className?: string
}

export function ContactForm({ children, className }: ContactFormProps) {
  return <div className={className}>{children}</div>
}
