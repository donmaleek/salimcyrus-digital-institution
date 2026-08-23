interface MemberListProps {
  children?: React.ReactNode
  className?: string
}

export function MemberList({ children, className }: MemberListProps) {
  return <div className={className}>{children}</div>
}
