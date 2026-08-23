interface DiscussionThreadProps {
  children?: React.ReactNode
  className?: string
}

export function DiscussionThread({ children, className }: DiscussionThreadProps) {
  return <div className={className}>{children}</div>
}
