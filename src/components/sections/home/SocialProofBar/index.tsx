interface SocialProofBarProps {
  children?: React.ReactNode
  className?: string
}

export function SocialProofBar({ children, className }: SocialProofBarProps) {
  return <div className={className}>{children}</div>
}
