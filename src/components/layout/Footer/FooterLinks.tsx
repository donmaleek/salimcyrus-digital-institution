interface FooterLinksProps {
  children?: React.ReactNode
  className?: string
}

export function FooterLinks({ children, className }: FooterLinksProps) {
  return <div className={className}>{children}</div>
}
