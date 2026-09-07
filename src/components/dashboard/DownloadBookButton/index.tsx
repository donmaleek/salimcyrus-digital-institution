'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

export function DownloadBookButton({ purchaseId }: { purchaseId: string }) {
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  async function download() {
    setLoading(true)
    try {
      const response = await fetch(`/api/books/my-purchases/${purchaseId}/download`, {
        method: 'POST',
      })
      const payload = (await response.json()) as { downloadUrl?: string; error?: string }
      if (!response.ok || !payload.downloadUrl) {
        showToast(payload.error ?? 'Could not start the download.', 'error')
        return
      }
      window.location.href = payload.downloadUrl
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={download} loading={loading} size="sm">
      Download
    </Button>
  )
}
