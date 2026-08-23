import '../styles/globals.css'
import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Inter, Alex_Brush } from 'next/font/google'
import { JsonLd } from '@/components/sections/shared/SEO'
import { ToastProvider } from '@/components/ui/Toast'
import { CONTACT_EMAIL, WHATSAPP_URL } from '@/lib/utils/constants'

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

const signature = Alex_Brush({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-signature',
  display: 'swap',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://salimcyrus.com'
const TITLE = 'Salim Cyrus | Relationship Coach, Speaker, Author, Kingdom Strategist'
const DESCRIPTION =
  'Empowering minds. Reforming hearts. Restoring purpose through truth and wisdom. The digital headquarters for Salim Cyrus and Halisi Hub Connect.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: '%s | Salim Cyrus',
  },
  description: DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: 'Salim Cyrus',
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
}

export const viewport: Viewport = {
  themeColor: '#0F1B2D',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: 'Salim Cyrus',
      url: SITE_URL,
    },
    {
      '@type': 'Person',
      name: 'Salim Cyrus',
      url: SITE_URL,
      jobTitle: 'Relationship Coach, Speaker, Author, Kingdom Strategist',
      email: CONTACT_EMAIL,
      sameAs: [WHATSAPP_URL],
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} ${signature.variable}`}>
      <body className="bg-cream font-body text-ink antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-navy-900"
        >
          Skip to content
        </a>
        <JsonLd data={jsonLd} />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
