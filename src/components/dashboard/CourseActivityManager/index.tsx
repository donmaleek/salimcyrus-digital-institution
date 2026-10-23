'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

export interface ActivityRow {
  enrollmentId: string
  userName: string
  userEmail: string
  enrolledAt: string
  distinctIpCount: number
  streamCount: number
  suspicious: boolean
}

export function CourseActivityManager({ courseId, rows }: { courseId: string; rows: ActivityRow[] }) {
  const [busyId, setBusyId] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const { showToast } = useToast()
  const router = useRouter()

  async function revoke(enrollmentId: string) {
    setBusyId(enrollmentId)
    const response = await fetch(`/api/admin/courses/${courseId}/enrollments/${enrollmentId}`, { method: 'DELETE' }).catch(() => null)
    setBusyId(null)
    setConfirmingId(null)
    if (!response || !response.ok) {
      showToast('Could not revoke access.', 'error')
      return
    }
    showToast('Access revoked.')
    router.refresh()
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-navy-200 bg-white p-8 text-center text-navy-500">
        No members enrolled yet.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-navy-100 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-navy-100 bg-navy-50 text-xs font-bold uppercase tracking-wide text-navy-500">
          <tr>
            <th className="px-4 py-3">Member</th>
            <th className="px-4 py-3">Enrolled</th>
            <th className="px-4 py-3">Distinct IPs (7d)</th>
            <th className="px-4 py-3">Streams (7d)</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.enrollmentId} className={`border-b border-navy-50 last:border-0 ${row.suspicious ? 'bg-red-50/60' : ''}`}>
              <td className="px-4 py-3">
                <p className="font-semibold text-navy">{row.userName}</p>
                <p className="text-xs text-navy-400">{row.userEmail}</p>
              </td>
              <td className="px-4 py-3 text-navy-600">{new Date(row.enrolledAt).toLocaleDateString()}</td>
              <td className="px-4 py-3">
                <span className={row.suspicious ? 'font-bold text-red-700' : 'text-navy-600'}>
                  {row.distinctIpCount}
                  {row.suspicious && ' ⚠'}
                </span>
              </td>
              <td className="px-4 py-3 text-navy-600">{row.streamCount}</td>
              <td className="px-4 py-3 text-right">
                {confirmingId === row.enrollmentId ? (
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-xs text-navy-500">Revoke this member&apos;s access?</span>
                    <Button type="button" size="sm" disabled={busyId === row.enrollmentId} onClick={() => revoke(row.enrollmentId)}>
                      Confirm
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmingId(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button type="button" variant="outline" size="sm" onClick={() => setConfirmingId(row.enrollmentId)}>
                    Revoke access
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
