import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Button } from '@/components/ui/Button'
import { JsonLd } from '@/components/sections/shared/SEO'
import { db } from '@/lib/db'
import { formatCurrency } from '@/lib/utils/currency'
import { AuthorCard } from '@/components/books/AuthorCard'
import { TeachingCheckoutForm } from '@/components/payments/TeachingCheckoutForm'
import { TeachingPurchaseReturn } from '@/components/payments/TeachingPurchaseReturn'

export const revalidate = 60

interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const teaching = await db.teaching.findUnique({ where: { slug: params.slug } })
  if (!teaching || teaching.status !== 'published') return { title: 'Teaching' }
  return {
    title: teaching.title,
    description: teaching.description,
    openGraph: {
      title: teaching.title,
      description: teaching.description,
      type: 'video.other',
      ...(teaching.thumbnailPath ? { images: [teaching.thumbnailPath] } : {}),
    },
  }
}

export default async function TeachingDetailPage({ params }: PageProps) {
  const teaching = await db.teaching.findUnique({ where: { slug: params.slug } })
  if (!teaching || teaching.status !== 'published') notFound()

  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  const buyerEmail = session?.user?.email ?? null

  const existingPurchase = userId
    ? await db.teachingPurchase.findFirst({ where: { teachingId: teaching.id, userId } })
    : null

  const watchUrl = `/dashboard/my-learning/teachings/${teaching.id}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: teaching.title,
    description: teaching.description,
    ...(teaching.thumbnailPath ? { thumbnailUrl: teaching.thumbnailPath } : {}),
    uploadDate: teaching.createdAt.toISOString(),
    offers: {
      '@type': 'Offer',
      price: teaching.priceKes,
      priceCurrency: 'KES',
      availability: 'https://schema.org/InStock',
    },
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <main className="bg-cream">
        <div className="mx-auto max-w-content px-6 py-8 sm:py-12">
          <nav aria-label="Breadcrumb" className="text-sm text-navy-500">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/teachings" className="hover:text-navy hover:underline">
                  Teaching Library
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="max-w-[60vw] truncate text-navy" aria-current="page">
                {teaching.title}
              </li>
            </ol>
          </nav>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px] lg:items-start">
            <div>
              <div className="aspect-video w-full overflow-hidden rounded-2xl bg-navy-50">
                {teaching.thumbnailPath ? (
                  <Image
                    src={teaching.thumbnailPath}
                    alt={`${teaching.title} thumbnail`}
                    width={800}
                    height={450}
                    priority
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center font-heading text-4xl font-bold text-gold-500">
                    SC
                  </div>
                )}
              </div>

              <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-gold-500">{teaching.category}</p>
              <h1 className="mt-2 font-heading text-3xl font-bold leading-tight text-navy sm:text-4xl">
                {teaching.title}
              </h1>
              <p className="mt-3 text-navy-600">
                by{' '}
                <Link href="/about" className="font-semibold text-navy underline-offset-2 hover:underline">
                  Salim Cyrus
                </Link>
              </p>

              <hr className="my-6 border-navy-100" />

              <h2 className="font-heading text-xl font-bold text-navy">About this teaching</h2>
              <p className="mt-3 max-w-2xl leading-relaxed text-navy-600">{teaching.description}</p>

              <div className="mt-8 max-w-md">
                <AuthorCard />
              </div>
            </div>

            <aside className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm lg:sticky lg:top-8">
              <p className="font-heading text-3xl font-bold text-navy">{formatCurrency(teaching.priceKes)}</p>
              <p className="mt-1 text-sm text-navy-500">Instant streaming access after payment</p>

              <div className="mt-5">
                {existingPurchase ? (
                  <Button href={watchUrl} size="lg" className="w-full">
                    Watch Now
                  </Button>
                ) : buyerEmail ? (
                  <>
                    <TeachingCheckoutForm
                      teachingId={teaching.id}
                      email={buyerEmail}
                      priceKes={teaching.priceKes}
                      priceUsd={teaching.priceUsd}
                    />
                    <Suspense>
                      <TeachingPurchaseReturn teachingId={teaching.id} watchUrl={watchUrl} />
                    </Suspense>
                  </>
                ) : (
                  <div data-testid="teaching-signin-gate">
                    <p className="text-sm text-navy-600">
                      Create a free account to buy this teaching. Your purchase and viewing access are tied to
                      your account.
                    </p>
                    <Button
                      href={`/register?callbackUrl=${encodeURIComponent(`/teachings/${teaching.slug}`)}`}
                      size="lg"
                      className="mt-3 w-full"
                    >
                      Sign Up to Buy
                    </Button>
                    <p className="mt-3 text-center text-sm text-navy-500">
                      Already have an account?{' '}
                      <Link
                        href={`/login?callbackUrl=${encodeURIComponent(`/teachings/${teaching.slug}`)}`}
                        className="font-semibold text-navy underline"
                      >
                        Log in
                      </Link>
                    </p>
                  </div>
                )}
              </div>

              <ul className="mt-6 space-y-2 border-t border-navy-100 pt-5 text-sm text-navy-600">
                <li className="flex gap-2">
                  <span aria-hidden="true">✓</span>
                  Stream instantly after payment, no download required
                </li>
                <li className="flex gap-2">
                  <span aria-hidden="true">✓</span>
                  Pay with PayPal, or M-Pesa Paybill with a quick review
                </li>
                <li className="flex gap-2">
                  <span aria-hidden="true">✓</span>
                  Lifetime access from your account&apos;s My Learning page
                </li>
              </ul>
            </aside>
          </div>
        </div>
      </main>
    </>
  )
}
