interface PricingTableProps {
  children?: React.ReactNode
  className?: string
}

export function PricingTable({ children, className }: PricingTableProps) {
  return <div className={className}>{children}</div>
}
