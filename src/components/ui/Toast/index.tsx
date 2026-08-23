interface ToastProps {
  children?: React.ReactNode
  className?: string
}

export function Toast({ children, className }: ToastProps) {
  return <div className={className}>{children}</div>
}
