interface NewsletterSignupProps {
  children?: React.ReactNode
  className?: string
}

export function NewsletterSignup({ children, className }: NewsletterSignupProps) {
  return <div className={className}>{children}</div>
}
