interface SocialIconProps {
  children?: React.ReactNode
  className?: string
}

export function SocialIcon({ children, className }: SocialIconProps) {
  return <div className={className}>{children}</div>
}
