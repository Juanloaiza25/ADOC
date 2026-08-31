import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { auditService } from '../services/auditService'

const ENTITY: Record<string, string> = { company: 'Empresa', checklist_response: 'Requisito', form_submission: 'Formulario', corrective_action: 'Acción correctiva', team_member: 'Miembro del equipo' }
const IGNORED_FIELDS = new Set(['updated_at', 'created_at', 'password_hash', 'data_json'])

export function AuditPage() {
  const [entity, setEntity] = useState('all')
  const audit = useQuery({ queryKey: ['audit'], queryFn: auditService.list })
  const visible = useMemo(() => (audit.data ?? []).filter((entry) => entity === 'all' || entry.entity_type === entity), [audit.data, entity])
  const changes = (before: Record<string, unknown> | null, after: Record<string, unknown> | null) => {
    const keys = new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})])
    return [...keys].filter((key) => !IGNORED_FIELDS.has(key) && JSON.stringify(before?.[key]) !== JSON.stringify(after?.[key])).slice(0, 5)
  }
  if (audit.isLoading) return <div className="flex justify-center py-24"><div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" /></div>
  return <div className="space-y-6"><header><Link to="/dashboard" className="text-sm text-primary-400">← Dashboard</Link><h1 className="mt-3 text-2xl font-bold text-white">Historial y auditoría</h1><p className="mt-1 text-gray-400">Registro inalterable de cambios realizados en la empresa.</p></header>
    <div className="flex flex-wrap gap-2">{['all', 'checklist_response', 'corrective_action', 'form_submission', 'company', 'team_member'].map((value) => <button key={value} onClick={() => setEntity(value)} className={`rounded-lg px-3 py-2 text-sm ${entity === value ? 'bg-primary-500/15 text-primary-400' : 'text-gray-500 hover:text-gray-300'}`}>{value === 'all' ? 'Todo' : ENTITY[value]}</button>)}</div>
    <section className="rounded-2xl border border-gray-800 bg-dark-900/50 p-5"><div className="divide-y divide-gray-800">{visible.map((entry) => { const fields = changes(entry.before, entry.after); return <article key={entry.id} className="py-4"><div className="flex flex-col justify-between gap-1 sm:flex-row"><div><span className="text-xs font-semibold uppercase text-primary-400">{ENTITY[entry.entity_type] ?? entry.entity_type}</span><h2 className="mt-1 text-sm font-medium text-white">{entry.action === 'created' ? 'Creado' : entry.action === 'role_updated' ? 'Rol actualizado' : 'Actualizado'} por {entry.user_name || entry.user_email || 'Usuario eliminado'}</h2></div><time className="text-xs text-gray-600">{new Date(entry.created_at).toLocaleString('es-CO')}</time></div>{fields.length > 0 && <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">{fields.map((field) => <div key={field} className="rounded-lg bg-dark-800/70 p-2"><span className="text-gray-500">{field}: </span><span className="text-red-300 line-through">{String(entry.before?.[field] ?? '—')}</span><span className="mx-2 text-gray-600">→</span><span className="text-emerald-300">{String(entry.after?.[field] ?? '—')}</span></div>)}</div>}</article>})}{!visible.length && <p className="py-10 text-center text-sm text-gray-500">Aún no hay movimientos para mostrar.</p>}</div></section>
  </div>
}
