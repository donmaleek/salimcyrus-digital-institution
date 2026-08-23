interface MembershipPlansProps {
  children?: React.ReactNode
  className?: string
}

export function MembershipPlans({ children, className }: MembershipPlansProps) {
  return <div className={className}>{children}</div>
}
