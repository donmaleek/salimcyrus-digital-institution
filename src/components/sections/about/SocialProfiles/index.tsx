import Link from 'next/link'
import { SocialIcon } from '@/components/ui/SocialIcon'
import { SOCIAL_LINKS } from '@/lib/utils/constants'

const profiles = [
  {
    name: 'LinkedIn',
    icon: 'linkedin' as const,
    handle: 'Salim Cyrus',
    description: 'Leadership, professional insight, partnerships, and speaking updates.',
    href: SOCIAL_LINKS.linkedin,
  },
  {
    name: 'TikTok',
    icon: 'tiktok' as const,
    handle: '@salimcyrusconnect',
    description: 'Direct reflections on relationships, identity, purpose, and daily life.',
    href: SOCIAL_LINKS.tiktok,
  },
  {
    name: 'X',
    icon: 'x' as const,
    handle: '@SalimCyruske',
    description: 'Short observations, public conversations, and ideas worth examining.',
    href: SOCIAL_LINKS.x,
  },
  {
    name: 'Instagram',
    icon: 'instagram' as const,
    handle: '@salimcyruske',
    description: 'Visual stories, books, events, community work, and moments with Salim.',
    href: SOCIAL_LINKS.instagram,
  },
  {
    name: 'Facebook',
    icon: 'facebook' as const,
    handle: 'Salim Cyrus',
    description: 'Longer community conversations, announcements, and shared resources.',
    href: SOCIAL_LINKS.facebook,
  },
]

export function SocialProfiles() {
  return (
    <section className="relative overflow-hidden bg-navy text-cream" aria-labelledby="social-profiles-heading" data-testid="about-social-profiles">
      <div className="absolute -right-24 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full border border-gold/20" aria-hidden />
      <div className="absolute -right-10 top-1/2 h-52 w-52 -translate-y-1/2 rounded-full border border-gold/20" aria-hidden />
      <div className="relative mx-auto max-w-content px-6 py-20 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Connect with Salim</p>
            <h2 id="social-profiles-heading" className="mt-3 font-heading text-3xl font-bold sm:text-5xl">Continue the conversation.</h2>
            <p className="mt-5 max-w-lg text-lg leading-8 text-cream/70">
              Choose the channel that fits how you like to learn, reflect, and stay connected. Every profile below is an official Salim Cyrus account.
            </p>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2">
            {profiles.map((profile, index) => (
              <li key={profile.name} className={index === profiles.length - 1 ? 'sm:col-span-2' : ''}>
                <Link href={profile.href} target="_blank" rel="noopener noreferrer" className="group flex h-full items-start gap-4 rounded-2xl border border-cream/15 bg-white/[0.06] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-gold/70 hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                  <SocialIcon name={profile.icon} href={profile.href} label={`Open Salim Cyrus on ${profile.name}`} linked={false} className="pointer-events-none h-11 w-11 shrink-0 border-gold/40 text-gold group-hover:bg-gold group-hover:text-navy" />
                  <span>
                    <span className="flex flex-wrap items-baseline gap-x-3">
                      <span className="font-heading text-xl font-bold text-white">{profile.name}</span>
                      <span className="text-xs font-semibold text-gold">{profile.handle}</span>
                    </span>
                    <span className="mt-2 block text-sm leading-6 text-cream/65">{profile.description}</span>
                  </span>
                  <span className="ml-auto text-gold transition-transform group-hover:translate-x-1" aria-hidden>↗</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
