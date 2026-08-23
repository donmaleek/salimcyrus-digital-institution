interface CaseStudyCardProps {
  children?: React.ReactNode
  className?: string
}

export function CaseStudyCard({ children, className }: CaseStudyCardProps) {
  return <div className={className}>{children}</div>
}
