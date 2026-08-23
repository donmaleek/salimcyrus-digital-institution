import '../styles/globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Salim Cyrus | Relationship Coach, Speaker, Author, Kingdom Strategist',
  description: 'The digital headquarters for Salim Cyrus and Halisi Hub Connect.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
