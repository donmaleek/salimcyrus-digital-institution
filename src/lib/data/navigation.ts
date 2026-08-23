export interface NavItem {
  label: string
  href: string
  children?: NavItem[]
}

export const mainNav: NavItem[] = [
  { label: 'About', href: '/about' },
  { label: 'Work With Salim', href: '/work-with-salim' },
  { label: 'Academy', href: '/academy' },
  { label: 'Knowledge Centre', href: '/knowledge-centre' },
  { label: 'Books', href: '/books' },
  { label: 'Halisi Hub Connect', href: '/halisi-hub-connect' },
  { label: 'Contact', href: '/contact' },
]
