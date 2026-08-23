interface CoachingPackageCardProps {
  children?: React.ReactNode
  className?: string
}

export function CoachingPackageCard({ children, className }: CoachingPackageCardProps) {
  return <div className={className}>{children}</div>
}
