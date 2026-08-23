interface RelatedArticlesProps {
  children?: React.ReactNode
  className?: string
}

export function RelatedArticles({ children, className }: RelatedArticlesProps) {
  return <div className={className}>{children}</div>
}
