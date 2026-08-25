'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Kind = 'contact' | 'task' | 'opportunity'

export function QuickCreate({
  kind,
  pipelines = [],
}: {
  kind: Kind
  pipelines?: Array<{
    id: string
    name: string
    stages: Array<{ id: string; name: string }>
  }>
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const labels = {
    contact: 'Add relationship',
    task: 'Create task',
    opportunity: 'Add opportunity',
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    const form = new FormData(event.currentTarget)
    const payload = Object.fromEntries(form.entries())
    const response = await fetch(
      `/api/admin/crm/${kind === 'opportunity' ? 'opportunities' : `${kind}s`}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    )
    if (!response.ok) {
      const result = await response.json().catch(() => ({}))
      setError(result.error || 'Could not save this record.')
      setBusy(false)
      return
    }
    setOpen(false)
    setBusy(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-navy shadow-sm transition hover:bg-gold-300"
      >
        {labels[kind]}
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-navy/60 p-0 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={labels[kind]}
        >
          <form
            onSubmit={submit}
            className="w-full max-w-xl rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-2xl font-bold text-navy">
                {labels[kind]}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full px-3 py-2 text-sm text-navy-500 hover:bg-navy-50"
              >
                Close
              </button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {kind === 'contact' && (
                <>
                  <Field name="firstName" label="First name" required />
                  <Field name="lastName" label="Last name" />
                  <Field name="email" label="Email" type="email" />
                  <Field name="phone" label="Phone / WhatsApp" />
                  <Select
                    name="lifecycleStage"
                    label="Lifecycle"
                    options={[
                      'lead',
                      'client',
                      'student',
                      'buyer',
                      'donor',
                      'partner',
                      'community',
                    ]}
                  />
                  <Select
                    name="source"
                    label="Source"
                    options={[
                      'manual',
                      'website',
                      'booking',
                      'newsletter',
                      'referral',
                      'event',
                      'whatsapp',
                      'import',
                    ]}
                  />
                </>
              )}
              {kind === 'task' && (
                <>
                  <div className="sm:col-span-2">
                    <Field
                      name="title"
                      label="What needs to happen?"
                      required
                    />
                  </div>
                  <Field
                    name="dueAt"
                    label="Due date"
                    type="datetime-local"
                    required
                  />
                  <Select
                    name="priority"
                    label="Priority"
                    options={['normal', 'high', 'urgent']}
                  />
                  <div className="sm:col-span-2">
                    <Field name="description" label="Completion context" />
                  </div>
                </>
              )}
              {kind === 'opportunity' && (
                <>
                  <div className="sm:col-span-2">
                    <Field name="title" label="Opportunity" required />
                  </div>
                  <Select
                    name="businessLine"
                    label="Business line"
                    options={[
                      'coaching',
                      'speaking',
                      'consulting',
                      'academy',
                      'books',
                      'community',
                      'donations',
                      'content',
                      'partnerships',
                    ]}
                  />
                  <Field
                    name="amount"
                    label="Expected value (KES)"
                    type="number"
                    required
                  />
                  {pipelines.length > 0 && (
                    <>
                      <Select
                        name="pipelineId"
                        label="Pipeline"
                        options={pipelines.map((p) => p.id)}
                        optionLabels={pipelines.map((p) => p.name)}
                      />
                      <Select
                        name="stageId"
                        label="Stage"
                        options={pipelines[0].stages.map((s) => s.id)}
                        optionLabels={pipelines[0].stages.map((s) => s.name)}
                      />
                    </>
                  )}
                  <Field
                    name="expectedCloseAt"
                    label="Expected close"
                    type="date"
                  />
                </>
              )}
            </div>
            {error && (
              <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}
            <button
              disabled={busy}
              className="mt-6 w-full rounded-xl bg-navy px-5 py-3 font-bold text-white disabled:opacity-50"
            >
              {busy ? 'Saving…' : 'Save record'}
            </button>
          </form>
        </div>
      )}
    </>
  )
}

function Field({
  name,
  label,
  type = 'text',
  required = false,
}: {
  name: string
  label: string
  type?: string
  required?: boolean
}) {
  return (
    <label className="text-sm font-semibold text-navy">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        className="mt-1.5 w-full rounded-xl border border-navy-200 px-3 py-2.5 font-normal outline-none focus:border-gold"
      />
    </label>
  )
}
function Select({
  name,
  label,
  options,
  optionLabels,
}: {
  name: string
  label: string
  options: string[]
  optionLabels?: string[]
}) {
  return (
    <label className="text-sm font-semibold text-navy">
      {label}
      <select
        name={name}
        className="mt-1.5 w-full rounded-xl border border-navy-200 px-3 py-2.5 font-normal outline-none focus:border-gold"
      >
        {options.map((option, index) => (
          <option key={option} value={option}>
            {optionLabels?.[index] || option.replaceAll('_', ' ')}
          </option>
        ))}
      </select>
    </label>
  )
}
