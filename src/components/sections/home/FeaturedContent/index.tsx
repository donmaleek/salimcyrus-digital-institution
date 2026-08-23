interface FeaturedContentProps {
  children?: React.ReactNode
  className?: string
}

export function FeaturedContent({ children, className }: FeaturedContentProps) {
  return <div className={className}>{children}</div>
}
