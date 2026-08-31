import { apiRequest } from '@/lib/api'

export interface DashboardData {
  summary: { total: number; compliant: number; nonCompliant: number; notApplicable: number; pending: number; progress: number; activeActions: number; overdue: number; upcomingDeadlines: number }
  checklists: Array<{ id: string; name: string; regulation_code: string; total: number; compliant: number; non_compliant: number; not_applicable: number; pending: number }>
  recent: Array<{ updated_at: string; title: string; status: string; actor: string | null }>
}

export const dashboardService = {
  get: () => apiRequest<DashboardData>('/api/dashboard'),
}
