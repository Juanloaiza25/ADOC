export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  company_id: string | null
  role: 'owner' | 'admin' | 'member'
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  nit: string | null
  address: string | null
  city: string | null
  department: string | null
  phone: string | null
  sector: string | null
  created_at: string
  updated_at: string
}

export interface CreateCompanyInput {
  name: string
  nit?: string
  address?: string
  city?: string
  department?: string
  phone?: string
  sector?: string
}

export interface UpdateCompanyInput extends Partial<CreateCompanyInput> {}
