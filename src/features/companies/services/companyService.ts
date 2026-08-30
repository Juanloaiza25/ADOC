import { apiRequest } from '@/lib/api'
import type { Company, CreateCompanyInput, UpdateCompanyInput } from '@/shared/types/database'

export const companyService = {
  async getById(id: string): Promise<Company | null> {
    void id
    const { company } = await apiRequest<{ company: Company | null }>('/api/company')
    return company
  },

  async create(input: CreateCompanyInput): Promise<Company> {
    const { company } = await apiRequest<{ company: Company }>('/api/companies', { method: 'POST', body: JSON.stringify(input) })
    return company
  },

  async update(id: string, input: UpdateCompanyInput): Promise<Company> {
    void id
    const { company } = await apiRequest<{ company: Company }>('/api/company', { method: 'PATCH', body: JSON.stringify(input) })
    return company
  },
}
