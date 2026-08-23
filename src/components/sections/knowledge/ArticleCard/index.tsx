interface ArticleCardProps {
  children?: React.ReactNode
  className?: string
}

export function ArticleCard({ children, className }: ArticleCardProps) {
  return <div className={className}>{children}</div>
}
