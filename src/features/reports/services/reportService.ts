import { apiRequest } from '@/lib/api'

export interface ReportExport {
  id: string
  report_type: string
  title: string
  generated_by_name: string | null
  generated_by_email: string
  created_at: string
}

export const reportService = {
  async history() {
    const { reports } = await apiRequest<{ reports: ReportExport[] }>('/api/reports/history')
    return reports
  },
  async record(reportType: string, title: string) {
    const { report } = await apiRequest<{ report: ReportExport }>('/api/reports/history', { method: 'POST', body: JSON.stringify({ reportType, title }) })
    return report
  },
}
