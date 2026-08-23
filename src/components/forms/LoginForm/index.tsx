interface LoginFormProps {
  children?: React.ReactNode
  className?: string
}

export function LoginForm({ children, className }: LoginFormProps) {
  return <div className={className}>{children}</div>
}
