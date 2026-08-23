interface PaymentFormProps {
  children?: React.ReactNode
  className?: string
}

export function PaymentForm({ children, className }: PaymentFormProps) {
  return <div className={className}>{children}</div>
}
