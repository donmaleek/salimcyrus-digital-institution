interface LessonPlayerProps {
  children?: React.ReactNode
  className?: string
}

export function LessonPlayer({ children, className }: LessonPlayerProps) {
  return <div className={className}>{children}</div>
}
