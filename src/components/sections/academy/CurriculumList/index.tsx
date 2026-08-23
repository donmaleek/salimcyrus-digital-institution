interface CurriculumListProps {
  children?: React.ReactNode
  className?: string
}

export function CurriculumList({ children, className }: CurriculumListProps) {
  return <div className={className}>{children}</div>
}
