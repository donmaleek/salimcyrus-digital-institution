'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'

const HOVER_DELAY_MS = 350

/**
 * Thumbnail that swaps to a short, muted, looping preview clip on hover,
 * like a YouTube catalog card. Delayed by HOVER_DELAY_MS so a mouse just
 * passing through doesn't trigger playback. previewSrc always points at
 * /api/teachings/preview (a separate, ungated teaser file) — never the
 * actual purchase-gated teaching, which only ever streams from
 * /api/teachings/stream behind a session + purchase check.
 *
 * The hover wrapper (and its listeners) is the outermost element
 * regardless of whether a thumbnail exists, so a teaching with a preview
 * clip but no thumbnail still previews on hover over the placeholder.
 */
export function TeachingHoverPreview({
  thumbnailSrc,
  previewSrc,
  alt,
}: {
  thumbnailSrc: string | null
  previewSrc: string | null
  alt: string
}) {
  const [showPreview, setShowPreview] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleEnter() {
    if (!previewSrc) return
    timeoutRef.current = setTimeout(() => setShowPreview(true), HOVER_DELAY_MS)
  }

  function handleLeave() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setShowPreview(false)
  }

  return (
    <div
      className="relative h-full w-full"
      data-testid="teaching-hover-preview"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {thumbnailSrc ? (
        <Image src={thumbnailSrc} alt={alt} fill unoptimized className="object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center font-heading text-2xl font-bold text-gold-500">
          SC
        </div>
      )}
      {showPreview && previewSrc && (
        <video
          src={previewSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  )
}
