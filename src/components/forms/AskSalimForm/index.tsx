interface AskSalimFormProps {
  children?: React.ReactNode
  className?: string
}

export function AskSalimForm({ children, className }: AskSalimFormProps) {
  return <div className={className}>{children}</div>
}
