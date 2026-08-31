import { apiRequest } from '@/lib/api'
import type { ActionPriority, ActionStatus, CorrectiveAction } from '@/shared/types/database'

export const actionService = {
  async list() {
    const { actions } = await apiRequest<{ actions: CorrectiveAction[] }>('/api/actions')
    return actions
  },
  async create(input: { checklistResponseId?: string; title: string; description?: string; assignedTo?: string; dueDate?: string; priority?: ActionPriority }) {
    const { action } = await apiRequest<{ action: CorrectiveAction }>('/api/actions', { method: 'POST', body: JSON.stringify(input) })
    return action
  },
  async update(id: string, input: Partial<{ title: string; description: string | null; assignedTo: string | null; dueDate: string | null; priority: ActionPriority; status: ActionStatus }>) {
    const { action } = await apiRequest<{ action: CorrectiveAction }>(`/api/actions/${id}`, { method: 'PATCH', body: JSON.stringify(input) })
    return action
  },
}
