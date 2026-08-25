import { CRM_PERMISSIONS, CRM_ROLES } from './contracts'
import { can } from './access'

describe('CRM role permissions', () => {
  it('defines every operating role in the permission matrix', () => {
    expect(Object.keys(CRM_PERMISSIONS).sort()).toEqual([...CRM_ROLES].sort())
  })

  it('gives the owner full access and protects finance writes from analysts', () => {
    expect(can('owner', 'finance:write')).toBe(true)
    expect(can('analyst', 'finance:write')).toBe(false)
    expect(can('finance', 'finance:write')).toBe(true)
  })

  it('allows functional teams to operate their own queues', () => {
    expect(can('sales', 'tasks:write')).toBe(true)
    expect(can('delivery', 'programs:write')).toBe(true)
    expect(can('marketing', 'campaigns:write')).toBe(true)
  })
})
