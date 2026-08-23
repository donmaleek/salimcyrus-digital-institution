interface ImageOptimizedProps {
  children?: React.ReactNode
  className?: string
}

export function ImageOptimized({ children, className }: ImageOptimizedProps) {
  return <div className={className}>{children}</div>
}
