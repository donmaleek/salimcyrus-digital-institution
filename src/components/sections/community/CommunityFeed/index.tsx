interface CommunityFeedProps {
  children?: React.ReactNode
  className?: string
}

export function CommunityFeed({ children, className }: CommunityFeedProps) {
  return <div className={className}>{children}</div>
}
