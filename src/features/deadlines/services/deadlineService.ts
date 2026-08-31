import { apiRequest } from '@/lib/api'

export type DeadlineType = 'document' | 'registration' | 'training' | 'inspection' | 'other'
export interface Deadline { id: string; title: string; type: DeadlineType; due_date: string; notes: string | null; status: 'pending' | 'completed' | 'cancelled'; completed_at: string | null }
export interface ActionDeadline { id: string; title: string; due_date: string; status: 'open' | 'in_progress'; priority: string; source: 'corrective_action' }

export const deadlineService = {
  get: () => apiRequest<{ deadlines: Deadline[]; actionDeadlines: ActionDeadline[] }>('/api/deadlines'),
  create: (input: { title: string; type: DeadlineType; dueDate: string; notes?: string }) => apiRequest('/api/deadlines', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: string, input: Partial<{ title: string; type: DeadlineType; dueDate: string; notes: string | null; status: Deadline['status'] }>) => apiRequest(`/api/deadlines/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
}
