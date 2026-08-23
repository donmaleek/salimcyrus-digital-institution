interface ModalProps {
  children?: React.ReactNode
  className?: string
}

export function Modal({ children, className }: ModalProps) {
  return <div className={className}>{children}</div>
}
