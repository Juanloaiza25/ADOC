import { apiRequest } from '@/lib/api'

export type TeamRole = 'owner' | 'admin' | 'auditor' | 'collaborator'
export interface TeamMember { id: string; email: string; full_name: string | null; role: TeamRole; created_at: string }
export interface TeamInvitation { id: string; email: string; role: Exclude<TeamRole, 'owner'>; token: string; expires_at: string; created_at: string }

export const teamService = {
  get: () => apiRequest<{ members: TeamMember[]; invitations: TeamInvitation[]; canManage: boolean }>('/api/team'),
  invite: (email: string, role: TeamInvitation['role']) => apiRequest<{ invitation: TeamInvitation }>('/api/team/invitations', { method: 'POST', body: JSON.stringify({ email, role }) }),
  updateRole: (id: string, role: TeamRole) => apiRequest(`/api/team/members/${id}`, { method: 'PATCH', body: JSON.stringify({ role }) }),
  accept: (token: string) => apiRequest(`/api/team/invitations/${token}/accept`, { method: 'POST' }),
}
