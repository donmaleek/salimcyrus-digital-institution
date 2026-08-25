import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { CRM_PERMISSIONS, CRM_ROLES, type CrmRole } from './contracts'

export interface CrmPrincipal {
  id: string
  name?: string | null
  email?: string | null
  role: CrmRole
}

function normalizeRole(role: unknown, isAdmin: unknown): CrmRole | null {
  if (typeof role === 'string' && CRM_ROLES.includes(role as CrmRole))
    return role as CrmRole
  return isAdmin === true ? 'owner' : null
}

export async function getCrmPrincipal(): Promise<CrmPrincipal | null> {
  const session = await getServerSession(authOptions)
  const user = session?.user as
    | {
        id?: string
        name?: string | null
        email?: string | null
        isAdmin?: boolean
        crmRole?: string
      }
    | undefined
  const role = normalizeRole(user?.crmRole, user?.isAdmin)
  if (!user?.id || !role) return null
  return { id: user.id, name: user.name, email: user.email, role }
}

export async function requireCrmPage(permission = 'crm:read') {
  const principal = await getCrmPrincipal()
  if (!principal || !can(principal.role, permission)) redirect('/dashboard')
  return principal
}

export async function requireCrmApi(permission = 'crm:read') {
  const principal = await getCrmPrincipal()
  return principal && can(principal.role, permission) ? principal : null
}

export function can(role: CrmRole, permission: string) {
  const grants = CRM_PERMISSIONS[role]
  if (grants.includes('*')) return true
  if (grants.includes(permission)) return true
  const [scope] = permission.split(':')
  return grants.includes(`${scope}:*`) || grants.includes('crm:*')
}
