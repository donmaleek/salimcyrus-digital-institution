interface SEOProps {
  children?: React.ReactNode
  className?: string
}

export function SEO({ children, className }: SEOProps) {
  return <div className={className}>{children}</div>
}
