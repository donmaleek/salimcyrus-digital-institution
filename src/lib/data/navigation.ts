export interface NavItem {
  label: string
  href: string
  children?: NavItem[]
}

export const mainNav: NavItem[] = [
  { label: 'About', href: '/about' },
  {
    label: 'Work With Salim',
    href: '/work-with-salim',
    children: [
      { label: 'Coaching', href: '/work-with-salim/coaching' },
      { label: 'Speaking', href: '/work-with-salim/speaking' },
      { label: 'Consulting', href: '/work-with-salim/consulting' },
    ],
  },
  {
    label: 'Academy',
    href: '/academy',
    children: [
      { label: 'Courses', href: '/academy/courses' },
      { label: 'Masterclasses', href: '/academy/masterclasses' },
    ],
  },
  { label: 'Knowledge Centre', href: '/knowledge-centre' },
  { label: 'Ask Salim', href: '/ask-salim' },
  { label: 'Journal', href: '/journal' },
  { label: 'Books', href: '/books' },
  {
    label: 'Halisi Hub Connect',
    href: '/halisi-hub-connect',
    children: [
      { label: 'Mission', href: '/halisi-hub-connect/mission' },
      { label: 'Community', href: '/halisi-hub-connect/community' },
      { label: 'Impact', href: '/halisi-hub-connect/impact' },
    ],
  },
  { label: 'Contact', href: '/contact' },
]

export const footerNav: NavItem[] = [
  { label: 'About', href: '/about' },
  { label: 'Coaching', href: '/work-with-salim/coaching' },
  { label: 'Academy', href: '/academy' },
  { label: 'Knowledge Centre', href: '/knowledge-centre' },
  { label: 'Books', href: '/books' },
  { label: 'Halisi Hub Connect', href: '/halisi-hub-connect' },
  { label: 'Events', href: '/events' },
  { label: 'Resources', href: '/resources' },
  { label: 'Testimonials', href: '/testimonials' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
  { label: 'Support the Mission', href: '/support-the-mission' },
]

export const legalNav: NavItem[] = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Disclaimers', href: '/disclaimers' },
]
