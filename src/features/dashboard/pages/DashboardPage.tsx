import { Link } from 'react-router-dom'
import { useProfile } from '@/features/users/hooks/useProfile'
import { useCompany } from '@/features/companies/hooks/useCompany'
import { CompanySetupPage } from '@/features/companies/pages/CompanySetupPage'

export function DashboardPage() {
  const { profile, isLoading: profileLoading } = useProfile()
  const { company, isLoading: companyLoading } = useCompany(profile?.company_id)

  const isLoading = profileLoading || (!!profile?.company_id && companyLoading)

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  if (!profile?.company_id || !company) {
    return <CompanySetupPage />
  }

  const cards = [
    {
      title: 'Checklist de cumplimiento',
      desc: 'Revisa lo que tienes y lo que falta para cumplir con INVIMA y BPM.',
      href: '/checklists',
      icon: '✓',
      highlight: true,
    },
    {
      title: 'Formularios',
      desc: 'Registro sanitario, solicitudes INVIMA y más.',
      href: '#',
      icon: '📋',
    },
    {
      title: 'Mi empresa',
      desc: 'Gestiona los datos de tu pyme.',
      href: '/settings/company',
      icon: '🏢',
    },
  ]

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Hola, {profile.full_name || 'Usuario'}
          </h1>
          <p className="text-gray-400 mt-1">
            {company.name}
            {company.sector && (
              <span className="text-primary-400"> · {company.sector}</span>
            )}
          </p>
        </div>
        <Link
          to="/settings/company"
          className="text-primary-400 hover:text-primary-300 font-medium text-sm transition-colors"
        >
          Editar empresa
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.href}
            className={`block p-6 rounded-2xl border transition-all hover:shadow-glow-sm ${
              card.highlight
                ? 'bg-dark-900/60 border-primary-500/30 hover:border-primary-500/50'
                : 'bg-dark-900/40 border-gray-800 hover:border-gray-700'
            }`}
          >
            <span className="text-2xl mb-3 block">{card.icon}</span>
            <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
            <p className="text-gray-400 text-sm mb-4">{card.desc}</p>
            <span className="text-primary-400 text-sm font-medium">
              {card.href === '#' ? 'Próximamente' : 'Ir →'}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
