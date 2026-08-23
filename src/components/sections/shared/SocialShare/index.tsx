interface SocialShareProps {
  children?: React.ReactNode
  className?: string
}

export function SocialShare({ children, className }: SocialShareProps) {
  return <div className={className}>{children}</div>
}
