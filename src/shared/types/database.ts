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

export type UpdateCompanyInput = Partial<CreateCompanyInput>

export type ChecklistResponseStatus = 'compliant' | 'non_compliant' | 'not_applicable' | 'pending'

export interface ChecklistItem {
  id: string
  checklist_id: string
  title: string
  description: string | null
  sort_order: number
  required: boolean
}

export interface Checklist {
  id: string
  name: string
  description: string | null
  regulation: { code: string; name: string } | null
  items: ChecklistItem[]
}

export interface CompanyChecklist {
  id: string
  company_id: string
  checklist_id: string
  status: 'pending' | 'in_progress' | 'completed'
  progress_percent: number
}

export interface ChecklistItemResponse {
  id: string
  company_checklist_id: string
  checklist_item_id: string
  status: ChecklistResponseStatus
  notes: string | null
  evidence_url: string | null
  evidence_key?: string | null
}

export interface FormField {
  name: string
  label: string
  type: 'text' | 'textarea' | 'date' | 'number' | 'select'
  required?: boolean
  options?: string[]
  placeholder?: string
}

export interface RegulatoryForm {
  id: string
  name: string
  description: string | null
  type: string | null
  version: number
  schema: { fields: FormField[] }
  regulation: { code: string; name: string } | null
}

export interface FormSubmission {
  id: string
  company_id: string
  form_id: string
  data: Record<string, string | number>
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  updated_at: string
}

export type ActionPriority = 'low' | 'medium' | 'high' | 'critical'
export type ActionStatus = 'open' | 'in_progress' | 'resolved' | 'cancelled'

export interface CorrectiveAction {
  id: string
  company_id: string
  checklist_response_id: string | null
  title: string
  description: string | null
  assigned_to: string | null
  assignee_name?: string | null
  assignee_email?: string | null
  requirement_title?: string | null
  checklist_name?: string | null
  due_date: string | null
  priority: ActionPriority
  status: ActionStatus
  created_at: string
  updated_at: string
  completed_at: string | null
}
