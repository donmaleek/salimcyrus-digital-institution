interface FooterProps {
  children?: React.ReactNode
  className?: string
}

export function Footer({ children, className }: FooterProps) {
  return <div className={className}>{children}</div>
}
