interface InputProps {
  children?: React.ReactNode
  className?: string
}

export function Input({ children, className }: InputProps) {
  return <div className={className}>{children}</div>
}
