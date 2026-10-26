import { redirect } from 'next/navigation'

// /dashboard/admin has no page of its own; send admins to the Command Center
// instead of a dead end. Access control is enforced by the CRM page itself.
export default function AdminIndexPage() {
  redirect('/dashboard/admin/crm')
}
