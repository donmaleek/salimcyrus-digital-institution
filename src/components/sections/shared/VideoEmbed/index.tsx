interface VideoEmbedProps {
  children?: React.ReactNode
  className?: string
}

export function VideoEmbed({ children, className }: VideoEmbedProps) {
  return <div className={className}>{children}</div>
}
