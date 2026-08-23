interface AccordionProps {
  children?: React.ReactNode
  className?: string
}

export function Accordion({ children, className }: AccordionProps) {
  return <div className={className}>{children}</div>
}
