interface MasterclassCardProps {
  children?: React.ReactNode
  className?: string
}

export function MasterclassCard({ children, className }: MasterclassCardProps) {
  return <div className={className}>{children}</div>
}
