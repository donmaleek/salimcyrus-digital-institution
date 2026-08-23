interface ButtonProps {
  children?: React.ReactNode
  className?: string
}

export function Button({ children, className }: ButtonProps) {
  return <div className={className}>{children}</div>
}
