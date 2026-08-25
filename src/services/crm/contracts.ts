export const CRM_ROLES = [
  'owner',
  'administrator',
  'sales',
  'finance',
  'delivery',
  'marketing',
  'community',
  'analyst',
] as const

export type CrmRole = (typeof CRM_ROLES)[number]

export const CRM_PERMISSIONS = {
  owner: ['*'],
  administrator: ['crm:*', 'content:*', 'settings:*'],
  sales: [
    'crm:read',
    'contacts:write',
    'opportunities:write',
    'tasks:write',
    'cases:write',
  ],
  finance: ['crm:read', 'finance:read', 'finance:write', 'exports:finance'],
  delivery: [
    'crm:read',
    'programs:write',
    'bookings:write',
    'cases:write',
    'tasks:write',
  ],
  marketing: ['crm:read', 'contacts:read', 'campaigns:write', 'content:write'],
  community: [
    'crm:read',
    'contacts:read',
    'community:write',
    'donations:read',
    'tasks:write',
  ],
  analyst: ['crm:read', 'reports:read', 'exports:approved'],
} satisfies Record<CrmRole, string[]>

export type BusinessLine =
  | 'coaching'
  | 'speaking'
  | 'consulting'
  | 'academy'
  | 'books'
  | 'community'
  | 'donations'
  | 'content'
  | 'partnerships'

export interface ExecutiveMetric {
  label: string
  value: string
  detail: string
  tone: 'navy' | 'gold' | 'green' | 'red'
}

export interface AttentionItem {
  id: string
  severity: 'critical' | 'warning' | 'info'
  title: string
  detail: string
  href: string
}
