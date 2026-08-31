import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useProfile } from '@/features/users/hooks/useProfile'
import { useCompany } from '@/features/companies/hooks/useCompany'
import { CompanySetupPage } from '@/features/companies/pages/CompanySetupPage'
import { dashboardService } from '../services/dashboardService'

const STATUS_LABELS: Record<string, string> = { compliant: 'Cumple', non_compliant: 'No cumple', not_applicable: 'No aplica', pending: 'Pendiente' }

export function DashboardPage() {
  const { profile, isLoading: profileLoading } = useProfile()
  const { company, isLoading: companyLoading } = useCompany(profile?.company_id)
  const dashboard = useQuery({ queryKey: ['dashboard', profile?.company_id], queryFn: dashboardService.get, enabled: Boolean(profile?.company_id) })
  const isLoading = profileLoading || (!!profile?.company_id && (companyLoading || dashboard.isLoading))

  if (isLoading) return <div className="flex justify-center py-24"><div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" /></div>
  if (!profile?.company_id || !company) return <CompanySetupPage />
  if (dashboard.error || !dashboard.data) return <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">No se pudo cargar el panel de cumplimiento.</div>

  const { summary, checklists, recent } = dashboard.data
  const metrics = [
    { label: 'Avance global', value: `${summary.progress}%`, color: 'text-primary-400' },
    { label: 'Cumplen', value: summary.compliant, color: 'text-emerald-400' },
    { label: 'No conformes', value: summary.nonCompliant, color: 'text-red-400' },
    { label: 'Acciones activas', value: summary.activeActions, color: 'text-amber-400' },
  ]

  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div><p className="text-sm font-medium text-primary-400">Panel de cumplimiento</p><h1 className="mt-1 text-2xl font-bold text-white">Hola, {profile.full_name || 'Usuario'}</h1><p className="mt-1 text-gray-400">{company.name}{company.sector && <span> · {company.sector}</span>}</p></div>
        <Link to="/settings/company" className="text-sm font-medium text-primary-400 hover:text-primary-300">Editar empresa</Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => <article key={metric.label} className="rounded-2xl border border-gray-800 bg-dark-900/60 p-5"><p className="text-sm text-gray-500">{metric.label}</p><strong className={`mt-2 block text-3xl ${metric.color}`}>{metric.value}</strong></article>)}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-gray-800 bg-dark-900/50 p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-semibold text-white">Avance por normativa</h2><p className="text-sm text-gray-500">Estado de todos los checklists activos</p></div><Link to="/checklists" className="text-sm text-primary-400">Ver checklists →</Link></div>
          <div className="space-y-5">{checklists.map((item) => {
            const evaluated = item.compliant + item.non_compliant + item.not_applicable
            const percent = item.total ? Math.round(evaluated * 100 / item.total) : 0
            return <div key={item.id}><div className="mb-2 flex justify-between gap-4 text-sm"><span className="font-medium text-gray-200">{item.name}<small className="ml-2 text-gray-600">{item.regulation_code}</small></span><span className="text-primary-400">{percent}%</span></div><div className="flex h-2 overflow-hidden rounded-full bg-dark-800"><span className="bg-emerald-500" style={{ width: `${item.total ? item.compliant * 100 / item.total : 0}%` }} /><span className="bg-red-500" style={{ width: `${item.total ? item.non_compliant * 100 / item.total : 0}%` }} /><span className="bg-gray-500" style={{ width: `${item.total ? item.not_applicable * 100 / item.total : 0}%` }} /></div><p className="mt-1 text-xs text-gray-600">{item.compliant} cumplen · {item.non_compliant} no conformes · {item.pending} pendientes</p></div>
          })}</div>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-dark-900/50 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-white">Actividad reciente</h2>
          <div className="mt-4 space-y-4">{recent.length ? recent.map((activity, index) => <div key={`${activity.updated_at}-${index}`} className="border-l-2 border-gray-800 pl-3"><p className="text-sm text-gray-300">{activity.title}</p><p className="mt-1 text-xs text-gray-500">{STATUS_LABELS[activity.status] ?? activity.status} · {activity.actor || 'Usuario'} · {new Date(activity.updated_at).toLocaleDateString('es-CO')}</p></div>) : <p className="text-sm text-gray-500">Todavía no hay actividad registrada.</p>}</div>
        </div>
      </section>

      {summary.nonCompliant > 0 && <section className="flex flex-col justify-between gap-4 rounded-2xl border border-red-500/25 bg-red-500/5 p-5 sm:flex-row sm:items-center"><div><h2 className="font-semibold text-red-300">Tienes {summary.nonCompliant} requisito{summary.nonCompliant === 1 ? '' : 's'} sin cumplir</h2><p className="mt-1 text-sm text-gray-400">Revísalos y crea acciones correctivas para cerrar las brechas.</p></div><Link to="/actions" className="shrink-0 rounded-lg bg-red-500/15 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-500/25">Gestionar acciones</Link></section>}
      {(summary.upcomingDeadlines > 0 || summary.overdue > 0) && <section className={`flex flex-col justify-between gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center ${summary.overdue ? 'border-red-500/25 bg-red-500/5' : 'border-amber-500/25 bg-amber-500/5'}`}><div><h2 className={`font-semibold ${summary.overdue ? 'text-red-300' : 'text-amber-300'}`}>{summary.overdue ? `${summary.overdue} vencimiento${summary.overdue === 1 ? '' : 's'} atrasado${summary.overdue === 1 ? '' : 's'}` : `${summary.upcomingDeadlines} vencimiento${summary.upcomingDeadlines === 1 ? '' : 's'} programado${summary.upcomingDeadlines === 1 ? '' : 's'}`}</h2><p className="mt-1 text-sm text-gray-400">Revisa las próximas fechas para mantener el cumplimiento al día.</p></div><Link to="/deadlines" className="shrink-0 rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300">Ver calendario</Link></section>}
    </div>
  )
}
