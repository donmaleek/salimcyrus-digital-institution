import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Salim Cyrus',
    short_name: 'Salim Cyrus',
    description: 'Empowering minds. Reforming hearts. Restoring purpose through truth and wisdom.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF7F1',
    theme_color: '#0F1B2D',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  }
}
