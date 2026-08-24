import { permanentRedirect } from 'next/navigation'

const journalPath =
  '/journal/people-vent-on-social-media-because-they-arent-heard-in-person'

export default function LegacyJournalEntryPage() {
  permanentRedirect(journalPath)
}
