import { API_URL, apiRequest } from '@/lib/api'
import type {
  Checklist,
  ChecklistItemResponse,
  ChecklistResponseStatus,
  CompanyChecklist,
} from '@/shared/types/database'

export const checklistService = {
  async listCatalog(): Promise<Checklist[]> {
    const { checklists } = await apiRequest<{ checklists: Array<Record<string, unknown> & { items: Checklist['items']; regulation_code: string; regulation_name: string }> }>('/api/checklists')
    return checklists.map((item) => ({ ...item, regulation: { code: item.regulation_code, name: item.regulation_name } })) as unknown as Checklist[]
  },

  async getOrCreateCompanyChecklist(companyId: string, checklistId: string): Promise<CompanyChecklist> {
    void companyId
    const { companyChecklist } = await apiRequest<{ companyChecklist: CompanyChecklist }>(`/api/company-checklists/${checklistId}`, { method: 'POST' })
    return companyChecklist
  },

  async listResponses(companyChecklistId: string): Promise<ChecklistItemResponse[]> {
    const { responses } = await apiRequest<{ responses: ChecklistItemResponse[] }>(`/api/company-checklists/${companyChecklistId}/responses`)
    return responses.map((response) => ({ ...response, evidence_url: response.evidence_key ?? response.evidence_url }))
  },

  async saveResponse(input: {
    companyChecklistId: string
    itemId: string
    status: ChecklistResponseStatus
    notes?: string
  }): Promise<{ progress: number }> {
    return apiRequest<{ progress: number }>(`/api/company-checklists/${input.companyChecklistId}/responses/${input.itemId}`, { method: 'PUT', body: JSON.stringify({ status: input.status, notes: input.notes }) })
  },

  async uploadEvidence(input: {
    companyId: string
    companyChecklistId: string
    itemId: string
    status: ChecklistResponseStatus
    notes?: string
    file: File
  }): Promise<void> {
    void input.companyId
    await this.saveResponse(input)
    const form = new FormData(); form.append('file', input.file)
    await apiRequest(`/api/company-checklists/${input.companyChecklistId}/responses/${input.itemId}/evidence`, { method: 'POST', body: form })
  },

  async getEvidenceUrl(path: string): Promise<string> {
    return `${API_URL}/api/evidence/${path}`
  },
}
