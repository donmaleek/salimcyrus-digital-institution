import type { Metadata } from 'next'

export function buildMetadata(title: string, description: string): Metadata {
  return { title, description }
}
