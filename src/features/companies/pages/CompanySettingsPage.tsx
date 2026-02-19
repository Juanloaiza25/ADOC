import { useProfile } from '@/features/users/hooks/useProfile'
import { useCompany } from '../hooks/useCompany'
import { CompanyForm } from '../components/CompanyForm'
import type { CreateCompanyInput } from '@/shared/types/database'

export function CompanySettingsPage() {
  const { profile } = useProfile()
  const { company, update, isUpdating } = useCompany(profile?.company_id ?? null)

  const handleSubmit = async (data: CreateCompanyInput) => {
    if (!company) return
    await update(data)
  }

  if (!profile?.company_id) {
    return (
      <div className="text-center py-12 text-gray-500">
        Primero debes crear tu empresa desde el dashboard.
      </div>
    )
  }

  if (!company) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-white mb-6">Datos de la empresa</h1>
      <div className="bg-dark-900/60 backdrop-blur border border-gray-800 rounded-2xl p-6 shadow-glow-sm">
        <CompanyForm company={company} onSubmit={handleSubmit} isLoading={isUpdating} />
      </div>
    </div>
  )
}
