/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  async redirects() {
    return [
      {
        source:
          '/people-vent-on-social-media-because-they-arent-heard-in-person',
        destination:
          '/journal/people-vent-on-social-media-because-they-arent-heard-in-person',
        permanent: true,
      },
      {
        source: '/academy/masterclasses/hekima-inner-circle',
        destination: '/academy/masterclasses/halisi-inner-circle',
        permanent: true,
      },
    ]
  },
  images: {
    // No remote image hosts are in use yet — every image is served from /public.
    // Add a specific hostname here (never a wildcard) once the Strapi CMS or
    // another external image source goes live; a wildcard turns the image
    // optimizer into an open SSRF/DoS proxy for the whole internet.
    remotePatterns: [],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
