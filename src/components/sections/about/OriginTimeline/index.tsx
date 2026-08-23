interface OriginTimelineProps {
  children?: React.ReactNode
  className?: string
}

export function OriginTimeline({ children, className }: OriginTimelineProps) {
  return <div className={className}>{children}</div>
}
