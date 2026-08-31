import { apiRequest } from '@/lib/api'

export interface AuditEntry {
  id: string
  entity_type: string
  entity_id: string
  action: string
  before: Record<string, unknown> | null
  after: Record<string, unknown> | null
  user_name: string | null
  user_email: string | null
  created_at: string
}

export const auditService = {
  async list() {
    const { entries } = await apiRequest<{ entries: AuditEntry[] }>('/api/audit')
    return entries
  },
}
