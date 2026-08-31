import { apiRequest } from '@/lib/api'

export interface AdminOverview {
  stats: { users: number; companies: number; activeActions: number; submittedForms: number }
  users: Array<{ id: string; email: string; full_name: string | null; role: string; is_platform_admin: number; suspended_at: string | null; company_name: string | null; created_at: string }>
  companies: Array<{ id: string; name: string; nit: string | null; member_count: number; created_at: string }>
  regulations: Array<{ id: string; code: string; name: string }>
}

export const adminService = {
  overview: () => apiRequest<AdminOverview>('/api/admin/overview'),
  suspend: (id: string, suspended: boolean) => apiRequest(`/api/admin/users/${id}/suspension`, { method: 'PATCH', body: JSON.stringify({ suspended }) }),
  resetPassword: (id: string, temporaryPassword: string) => apiRequest(`/api/admin/users/${id}/reset-password`, { method: 'POST', body: JSON.stringify({ temporaryPassword }) }),
  createRegulation: (input: { code: string; name: string; entity?: string }) => apiRequest('/api/admin/regulations', { method: 'POST', body: JSON.stringify(input) }),
  createChecklist: (input: { regulationId: string; name: string; description?: string; items: Array<{ title: string }> }) => apiRequest('/api/admin/checklists', { method: 'POST', body: JSON.stringify(input) }),
  createForm: (input: { regulationId?: string; name: string; type: string; description?: string; fields: Array<{ name: string; label: string; type: string; required: boolean }> }) => apiRequest('/api/admin/forms', { method: 'POST', body: JSON.stringify(input) }),
}
