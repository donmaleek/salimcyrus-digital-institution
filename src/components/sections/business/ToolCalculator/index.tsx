interface ToolCalculatorProps {
  children?: React.ReactNode
  className?: string
}

export function ToolCalculator({ children, className }: ToolCalculatorProps) {
  return <div className={className}>{children}</div>
}
