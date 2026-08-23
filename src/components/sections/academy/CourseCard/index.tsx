interface CourseCardProps {
  children?: React.ReactNode
  className?: string
}

export function CourseCard({ children, className }: CourseCardProps) {
  return <div className={className}>{children}</div>
}
