import '../styles/globals.css'
import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Salim Cyrus | Relationship Coach, Speaker, Author, Kingdom Strategist',
    template: '%s | Salim Cyrus',
  },
  description:
    'Empowering minds. Reforming hearts. Restoring purpose through truth and wisdom. The digital headquarters for Salim Cyrus and Halisi Hub Connect.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="bg-cream font-body text-ink antialiased">{children}</body>
    </html>
  )
}
