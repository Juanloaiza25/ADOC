import { supabase } from '@/lib/supabase'
import type { Company, CreateCompanyInput, UpdateCompanyInput } from '@/shared/types/database'

export const companyService = {
  async getById(id: string): Promise<Company | null> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as Company
  },

  async create(input: CreateCompanyInput): Promise<Company> {
    const { data, error } = await supabase
      .from('companies')
      .insert({
        name: input.name,
        nit: input.nit ?? null,
        address: input.address ?? null,
        city: input.city ?? null,
        department: input.department ?? null,
        phone: input.phone ?? null,
        sector: input.sector ?? null,
      })
      .select()
      .single()
    if (error) throw error
    return data as Company
  },

  async update(id: string, input: UpdateCompanyInput): Promise<Company> {
    const { data, error } = await supabase
      .from('companies')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as Company
  },
}
