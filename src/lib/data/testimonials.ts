export interface TestimonialEntry {
  quote: string
  name: string
  role: string
  featured?: boolean
}

export const testimonials: TestimonialEntry[] = [
  {
    quote:
      "After one session, I made a decision I had delayed for years. The clarity wasn't emotional. It was structural. Within four weeks I stopped reacting to the calendar and started running the demands I chose — the accountability kept me honest.",
    name: 'Selena',
    role: 'VP of Product',
    featured: true,
  },
  { quote: 'I stopped overthinking and started executing.', name: 'Milo', role: 'Strategy Lead' },
  { quote: 'I finally set boundaries without guilt.', name: 'Aria', role: 'Executive Coach' },
  { quote: 'My life got quieter inside.', name: 'Jordan', role: 'Creative Director' },
  { quote: 'The plan was simple — and it worked.', name: 'Nora', role: 'Operations Partner' },
  { quote: 'I regained control of my days.', name: 'Theo', role: 'Product Lead' },
  { quote: 'It felt private, honest, and practical.', name: 'Imani', role: 'Design Strategist' },
]
