interface LearningProgressProps {
  children?: React.ReactNode
  className?: string
}

export function LearningProgress({ children, className }: LearningProgressProps) {
  return <div className={className}>{children}</div>
}
