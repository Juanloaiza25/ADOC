import { apiRequest } from '@/lib/api'
import type { FormSubmission, RegulatoryForm } from '@/shared/types/database'

export const formService = {
  async list(): Promise<RegulatoryForm[]> {
    const { forms } = await apiRequest<{ forms: Array<Record<string, unknown> & { regulation_code: string; regulation_name: string }> }>('/api/forms')
    return forms.map((form) => ({ ...form, regulation: { code: form.regulation_code, name: form.regulation_name } })) as unknown as RegulatoryForm[]
  },

  async getSubmission(companyId: string, formId: string): Promise<FormSubmission | null> {
    void companyId
    const { submission } = await apiRequest<{ submission: FormSubmission | null }>(`/api/forms/${formId}/submission`)
    return submission
  },

  async saveDraft(companyId: string, formId: string, data: Record<string, string | number>): Promise<FormSubmission> {
    void companyId
    const { submission } = await apiRequest<{ submission: FormSubmission }>(`/api/forms/${formId}/submission`, { method: 'PUT', body: JSON.stringify({ data, status: 'draft' }) })
    return submission
  },

  async submit(companyId: string, formId: string, data: Record<string, string | number>): Promise<FormSubmission> {
    void companyId
    const { submission } = await apiRequest<{ submission: FormSubmission }>(`/api/forms/${formId}/submission`, { method: 'PUT', body: JSON.stringify({ data, status: 'submitted' }) })
    return submission
  },
}
