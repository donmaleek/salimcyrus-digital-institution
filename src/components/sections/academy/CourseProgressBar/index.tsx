interface CourseProgressBarProps {
  children?: React.ReactNode
  className?: string
}

export function CourseProgressBar({ children, className }: CourseProgressBarProps) {
  return <div className={className}>{children}</div>
}
