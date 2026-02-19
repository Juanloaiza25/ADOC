import { useCompany } from '../hooks/useCompany'
import { CompanyForm } from '../components/CompanyForm'
import type { CreateCompanyInput } from '@/shared/types/database'

export function CompanySetupPage() {
  const { create, isCreating } = useCompany(null)

  const handleSubmit = async (data: CreateCompanyInput) => {
    await create(data)
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-dark-900/60 backdrop-blur border border-gray-800 rounded-2xl p-8 shadow-glow-sm">
        <h1 className="text-2xl font-bold text-white mb-2">
          Configura tu empresa
        </h1>
        <p className="text-gray-400 mb-6">
          Para comenzar con el cumplimiento normativo, registra los datos de tu pyme.
        </p>
        <CompanyForm
          company={null}
          onSubmit={handleSubmit}
          isLoading={isCreating}
        />
      </div>
    </div>
  )
}
