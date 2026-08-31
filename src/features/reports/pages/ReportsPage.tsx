import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useProfile } from '@/features/users/hooks/useProfile'
import { useCompany } from '@/features/companies/hooks/useCompany'
import { dashboardService } from '@/features/dashboard/services/dashboardService'
import { actionService } from '@/features/actions/services/actionService'
import { downloadCsv, openPrintableReport, safeFileName } from '@/lib/export'
import { reportService } from '../services/reportService'

export function ReportsPage() {
  const queryClient = useQueryClient()
  const { profile } = useProfile()
  const { company } = useCompany(profile?.company_id)
  const dashboard = useQuery({ queryKey: ['dashboard', profile?.company_id], queryFn: dashboardService.get, enabled: Boolean(profile?.company_id) })
  const actions = useQuery({ queryKey: ['actions'], queryFn: actionService.list })
  const history = useQuery({ queryKey: ['report-history'], queryFn: reportService.history })
  const loading = dashboard.isLoading || actions.isLoading || history.isLoading

  const record = async (type: string, title: string) => {
    await reportService.record(type, title)
    await queryClient.invalidateQueries({ queryKey: ['report-history'] })
  }

  const generatePdf = () => {
    if (!dashboard.data || !company) return
    const title = `Reporte consolidado de cumplimiento - ${company.name}`
    const summary = dashboard.data.summary
    const activeActions = (actions.data ?? []).filter((action) => ['open', 'in_progress'].includes(action.status))
    const opened = openPrintableReport({
      title: 'Reporte consolidado de cumplimiento',
      subtitle: [`NIT: ${company.nit || 'No registrado'}`, [company.city, company.department].filter(Boolean).join(', '), company.sector].filter(Boolean).join(' · '),
      company: company.name,
      summary: `Avance global: ${summary.progress}% · Cumplen: ${summary.compliant} · No conformes: ${summary.nonCompliant} · Pendientes: ${summary.pending}`,
      rows: [
        ...dashboard.data.checklists.map((checklist) => ({ label: `${checklist.name} (${checklist.regulation_code})`, detail: `${checklist.compliant} cumplen · ${checklist.non_compliant} no conformes · ${checklist.pending} pendientes`, value: `${checklist.total ? Math.round((checklist.compliant + checklist.non_compliant + checklist.not_applicable) * 100 / checklist.total) : 0}% evaluado` })),
        ...activeActions.map((action) => ({ label: `Acción: ${action.title}`, detail: `${action.requirement_title || 'Acción general'} · Prioridad ${action.priority} · Vence ${action.due_date || 'sin fecha'}`, value: action.status === 'in_progress' ? 'En progreso' : 'Abierta' })),
      ],
    })
    if (opened) void record('compliance_pdf', title)
  }

  const generateCsv = () => {
    if (!dashboard.data || !company) return
    const title = `Datos de cumplimiento - ${company.name}`
    downloadCsv(`reporte-${safeFileName(company.name)}.csv`, ['Checklist', 'Norma', 'Total', 'Cumplen', 'No cumplen', 'No aplica', 'Pendientes', 'Avance'], dashboard.data.checklists.map((item) => [item.name, item.regulation_code, item.total, item.compliant, item.non_compliant, item.not_applicable, item.pending, `${item.total ? Math.round((item.compliant + item.non_compliant + item.not_applicable) * 100 / item.total) : 0}%`]))
    void record('compliance_csv', title)
  }

  if (loading) return <div className="flex justify-center py-24"><div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" /></div>
  return <div className="space-y-7">
    <header><Link to="/dashboard" className="text-sm text-primary-400">← Dashboard</Link><h1 className="mt-3 text-2xl font-bold text-white">Centro de reportes</h1><p className="mt-1 text-gray-400">Genera documentos ejecutivos con el estado normativo de la empresa.</p></header>
    <section className="rounded-2xl border border-primary-500/30 bg-gradient-to-br from-primary-500/10 to-dark-900 p-6"><p className="text-sm font-semibold uppercase tracking-wide text-primary-400">Reporte principal</p><h2 className="mt-2 text-xl font-semibold text-white">Consolidado de cumplimiento</h2><p className="mt-2 max-w-2xl text-sm text-gray-400">Incluye datos de la empresa, avance por normativa, hallazgos y acciones correctivas activas.</p><div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={generatePdf} className="rounded-lg bg-primary-500 px-4 py-2 font-semibold text-dark-950 hover:bg-primary-400">Imprimir / Guardar PDF</button><button type="button" onClick={generateCsv} className="rounded-lg border border-gray-700 px-4 py-2 text-gray-300 hover:border-primary-500">Exportar datos CSV</button></div></section>
    <section className="rounded-2xl border border-gray-800 bg-dark-900/50 p-5 sm:p-6"><h2 className="text-lg font-semibold text-white">Historial de reportes</h2><div className="mt-4 divide-y divide-gray-800">{history.data?.map((report) => <div key={report.id} className="flex flex-col justify-between gap-1 py-3 sm:flex-row sm:items-center"><div><p className="text-sm text-gray-200">{report.title}</p><p className="text-xs text-gray-600">{report.report_type.includes('pdf') ? 'PDF / impresión' : 'CSV'} · {report.generated_by_name || report.generated_by_email}</p></div><time className="text-xs text-gray-500">{new Date(report.created_at).toLocaleString('es-CO')}</time></div>)}{!history.data?.length && <p className="py-8 text-center text-sm text-gray-500">Aún no se han generado reportes.</p>}</div></section>
  </div>
}
