'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

interface Question {
  id: string
  slug: string | null
  category: string
  question: string
  context: string | null
  askerName: string | null
  askerEmail: string | null
  publicationPreference: string
  status: string
  answer: string | null
  publishedAt: string | null
  createdAt: string
}

const preferenceLabel: Record<string, string> = {
  first_name: 'Publish with first name',
  anonymous: 'Publish anonymously',
  private: 'Keep private',
}

function QuestionRow({
  question,
  onUpdate,
  onDelete,
}: {
  question: Question
  onUpdate: (id: string, patch: Partial<Question>) => void
  onDelete: (id: string) => void
}) {
  const [draftAnswer, setDraftAnswer] = useState(question.answer ?? '')
  const [busy, setBusy] = useState<'save' | 'publish' | 'unpublish' | null>(null)
  const { showToast } = useToast()

  async function submit(publish?: boolean) {
    const action = publish === true ? 'publish' : publish === false ? 'unpublish' : 'save'
    setBusy(action)
    try {
      const res = await fetch(`/api/admin/ask-salim/${question.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: draftAnswer, publish }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        showToast(body.error ?? 'Could not save.', 'error')
        return
      }

      const { question: updated } = await res.json()
      onUpdate(question.id, {
        answer: updated.answer,
        status: updated.status,
        slug: updated.slug,
        publishedAt: updated.publishedAt,
      })
      showToast(
        publish === true ? 'Published.' : publish === false ? 'Unpublished.' : 'Answer saved.'
      )
    } finally {
      setBusy(null)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this question permanently?')) return
    const res = await fetch(`/api/admin/ask-salim/${question.id}`, { method: 'DELETE' })
    if (!res.ok) {
      showToast('Could not delete.', 'error')
      return
    }
    onDelete(question.id)
    showToast('Deleted.')
  }

  const isPrivate = question.publicationPreference === 'private'
  const isPublished = Boolean(question.publishedAt)

  return (
    <div className="rounded-xl border border-navy-100 bg-white p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-navy-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-navy-500">
          {question.category}
        </span>
        <span className="text-xs font-semibold text-navy-400">
          {preferenceLabel[question.publicationPreference] ?? question.publicationPreference}
        </span>
        {isPublished && (
          <span className="rounded-full bg-gold/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-gold-500">
            Published
          </span>
        )}
        {question.askerEmail && (
          <span className="text-xs text-navy-400">{question.askerEmail}</span>
        )}
      </div>

      <p className="mt-3 font-heading text-lg font-semibold text-navy">{question.question}</p>
      {question.context && <p className="mt-2 text-sm text-navy-500">{question.context}</p>}

      <label htmlFor={`answer-${question.id}`} className="mt-4 block text-sm font-semibold text-navy">
        Answer
      </label>
      <textarea
        id={`answer-${question.id}`}
        rows={5}
        value={draftAnswer}
        onChange={(e) => setDraftAnswer(e.target.value)}
        placeholder="Write the answer here…"
        className="mt-2 w-full resize-y rounded-lg border border-navy-200 px-3 py-2 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
      />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button size="sm" variant="outline" disabled={busy !== null || draftAnswer.trim().length < 10} onClick={() => submit()}>
          {busy === 'save' ? 'Saving…' : 'Save Answer'}
        </Button>
        {isPrivate ? (
          <span className="text-xs text-navy-400">Marked private — can&apos;t be published.</span>
        ) : isPublished ? (
          <Button size="sm" disabled={busy !== null} onClick={() => submit(false)}>
            {busy === 'unpublish' ? 'Unpublishing…' : 'Unpublish'}
          </Button>
        ) : (
          <Button size="sm" disabled={busy !== null || draftAnswer.trim().length < 10} onClick={() => submit(true)}>
            {busy === 'publish' ? 'Publishing…' : 'Save & Publish'}
          </Button>
        )}
        {question.slug && isPublished && (
          <Link
            href={`/ask-salim/${question.slug}`}
            target="_blank"
            className="text-sm font-semibold text-gold-500 hover:underline"
          >
            View
          </Link>
        )}
        <Button size="sm" variant="ghost" onClick={handleDelete}>
          Delete
        </Button>
      </div>
    </div>
  )
}

export function AskSalimManager({ initialQuestions }: { initialQuestions: Question[] }) {
  const [questions, setQuestions] = useState(initialQuestions)

  function handleUpdate(id: string, patch: Partial<Question>) {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)))
  }

  function handleDelete(id: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  if (questions.length === 0) {
    return <p className="text-sm text-navy-400">No questions submitted yet.</p>
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <QuestionRow
          key={question.id}
          question={question}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}
