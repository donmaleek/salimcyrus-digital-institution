interface TableOfContentsProps {
  children?: React.ReactNode
  className?: string
}

export function TableOfContents({ children, className }: TableOfContentsProps) {
  return <div className={className}>{children}</div>
}
