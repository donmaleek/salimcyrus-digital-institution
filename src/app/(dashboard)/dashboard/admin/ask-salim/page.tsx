import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { AskSalimManager } from '@/components/dashboard/AskSalimManager'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Ask Salim Questions',
}

export default async function AdminAskSalimPage() {
  const session = await getServerSession(authOptions)
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin === true

  if (!isAdmin) {
    redirect('/dashboard')
  }

  const questions = await db.askSalimQuestion.findMany({
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  })

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy">Ask Salim Questions</h1>
      <p className="mt-2 max-w-2xl text-sm text-navy-500">
        Review submitted questions, write an answer, and publish the ones that should
        become a public page. Questions marked &quot;keep private&quot; can be answered
        for your own records but will never be published, even if you try.
      </p>
      <div className="mt-8">
        <AskSalimManager
          initialQuestions={questions.map((q) => ({
            id: q.id,
            slug: q.slug,
            category: q.category,
            question: q.question,
            context: q.context,
            askerName: q.askerName,
            askerEmail: q.askerEmail,
            publicationPreference: q.publicationPreference,
            status: q.status,
            answer: q.answer,
            publishedAt: q.publishedAt?.toISOString() ?? null,
            createdAt: q.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  )
}
