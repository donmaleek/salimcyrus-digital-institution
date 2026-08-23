import Image from 'next/image'

const paragraphs = [
  'The first time I guided someone through a tough pivot, I felt the same calm curiosity that I now bring to every session. Coaching has never been about quick fixes for me — it has always been about creating rituals that honor our full humanity, noticing the stories we repeat, and designing practical systems that keep people anchored through change.',
  'I studied psychology and later immersed myself in embodiment practices because I wanted a framework that honored both heart and strategy. Along the way I led workshops for restless executives and weary parents, and it became clear: the work that lights me up is helping good people rebuild trust with themselves — not because they are broken, but because they are stretched thin.',
  'Today I blend deep listening, structured accountability, and creative experiments so my clients can feel both seen and empowered. Whether the goal is a career shift, a reset after burnout, or crafting a life that feels meaningful again, I help people step into decisions with grounded confidence and long-term momentum.',
]

const pillars = [
  { title: 'Rooted in real life', description: 'Every dialogue I craft is grounded in the messy weekdays my clients actually live in, so the actions we design move with calendars, families, and boardrooms — not around them.' },
  { title: 'Built for clarity', description: 'Sessions blend spacious reflection with practical experiments, creating a steady rhythm that keeps you honest about the next right action even when the world shifts.' },
  { title: 'Guided by wisdom + data', description: 'I pair embodied listening with simple frameworks so you trust your intuition while still proving progress with tangible, measurable results.' },
]

export function Story() {
  return (
    <section className="border-t border-navy-100 bg-cream">
      <div className="mx-auto max-w-content px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,340px)_1fr] lg:items-start">
          <div className="relative mx-auto w-full max-w-xs overflow-hidden rounded-3xl bg-navy-50 lg:mx-0 lg:max-w-none">
            <Image
              src="/images/salim/story.webp"
              alt="Salim Cyrus"
              width={784}
              height={1360}
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
              Story
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl">
              My Story.
            </h2>
            <div className="mt-8 max-w-2xl space-y-6 text-navy-600">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="rounded-2xl border border-navy-100 bg-white p-6">
              <h3 className="font-heading text-lg font-semibold text-navy">{pillar.title}</h3>
              <p className="mt-2 text-sm text-navy-500">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
