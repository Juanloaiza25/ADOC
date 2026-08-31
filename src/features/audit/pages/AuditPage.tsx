import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { auditService } from '../services/auditService'

const ENTITY: Record<string, string> = {
  company: 'Empresa', checklist_response: 'Requisito', form_submission: 'Formulario', corrective_action: 'Acción correctiva', team_member: 'Miembro del equipo', deadline: 'Vencimiento',
}
const FIELD: Record<string, string> = {
  title: 'Nombre', description: 'Descripción', status: 'Estado', notes: 'Notas', type: 'Tipo', due_date: 'Fecha de vencimiento', completed_at: 'Fecha de finalización', priority: 'Prioridad', role: 'Rol', membership: 'Pertenencia al equipo', email: 'Correo', name: 'Persona', full_name: 'Nombre', nit: 'NIT', address: 'Dirección', city: 'Ciudad', department: 'Departamento', phone: 'Teléfono', sector: 'Sector', progress_percent: 'Progreso', evidence_key: 'Evidencia',
}
const VALUE: Record<string, string> = {
  pending: 'Pendiente', completed: 'Completado', cancelled: 'Cancelado', open: 'Abierta', in_progress: 'En progreso', resolved: 'Resuelta', compliant: 'Cumple', non_compliant: 'No cumple', not_applicable: 'No aplica', document: 'Documento', registration: 'Registro sanitario', training: 'Capacitación', inspection: 'Inspección', other: 'Otro', low: 'Baja', medium: 'Media', high: 'Alta', critical: 'Crítica', owner: 'Propietario', admin: 'Administrador', auditor: 'Auditor', collaborator: 'Colaborador', removed: 'Retirado',
}
const IGNORED = new Set(['id', 'company_id', 'created_by', 'submitted_by', 'responded_by', 'assigned_to', 'checklist_response_id', 'company_checklist_id', 'checklist_item_id', 'form_id', 'user_id', 'updated_at', 'created_at', 'password_hash', 'data_json', 'before_json', 'after_json'])

function formatDate(value: string, dateOnly = false) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(`${value}T00:00:00`).toLocaleDateString('es-CO', { dateStyle: 'long' })
  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value) ? `${value.replace(' ', 'T')}Z` : value
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return value
  return dateOnly ? date.toLocaleDateString('es-CO', { dateStyle: 'long' }) : date.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
}

function formatValue(field: string, value: unknown) {
  if (value === null || value === undefined || value === '') return 'Sin dato'
  const text = String(value)
  if (VALUE[text]) return VALUE[text]
  if (field.endsWith('_at') || field === 'due_date') return formatDate(text, field === 'due_date')
  if (typeof value === 'boolean' || value === 0 || value === 1) return value ? 'Sí' : 'No'
  if (typeof value === 'object') return 'Información actualizada'
  return text
}

export function AuditPage() {
  const [entity, setEntity] = useState('all')
  const audit = useQuery({ queryKey: ['audit'], queryFn: auditService.list })
  const visible = useMemo(() => (audit.data ?? []).filter((entry) => entity === 'all' || entry.entity_type === entity), [audit.data, entity])
  const changes = (before: Record<string, unknown> | null, after: Record<string, unknown> | null) => {
    const keys = new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})])
    return [...keys].filter((key) => !IGNORED.has(key) && !key.endsWith('_id') && JSON.stringify(before?.[key]) !== JSON.stringify(after?.[key])).slice(0, 8)
  }
  const actionLabel = (action: string) => action === 'created' ? 'Creado' : action === 'role_updated' ? 'Rol actualizado' : action === 'removed' ? 'Retirado del equipo' : 'Actualizado'

  if (audit.isLoading) return <div className="flex justify-center py-24"><div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" /></div>
  return <div className="space-y-6">
    <header><Link to="/dashboard" className="text-sm text-primary-400">← Dashboard</Link><h1 className="mt-3 text-2xl font-bold text-white">Historial y auditoría</h1><p className="mt-1 text-gray-400">Consulta los cambios importantes sin códigos técnicos.</p></header>
    <div className="flex flex-wrap gap-2">{['all', 'checklist_response', 'corrective_action', 'deadline', 'form_submission', 'company', 'team_member'].map((value) => <button key={value} onClick={() => setEntity(value)} className={`rounded-lg px-3 py-2 text-sm ${entity === value ? 'bg-primary-500/15 text-primary-400' : 'text-gray-500 hover:text-gray-300'}`}>{value === 'all' ? 'Todo' : ENTITY[value]}</button>)}</div>
    <section className="rounded-2xl border border-gray-800 bg-dark-900/50 p-5"><div className="divide-y divide-gray-800">{visible.map((entry) => {
      const fields = changes(entry.before, entry.after)
      const subject = String(entry.after?.title ?? entry.before?.title ?? entry.after?.name ?? entry.before?.name ?? '')
      return <article key={entry.id} className="py-5"><div className="flex flex-col justify-between gap-2 sm:flex-row"><div><span className="text-xs font-semibold uppercase tracking-wide text-primary-400">{ENTITY[entry.entity_type] ?? 'Actividad'}</span><h2 className="mt-1 font-medium text-white">{subject || actionLabel(entry.action)}</h2><p className="mt-1 text-xs text-gray-500">{actionLabel(entry.action)} por {entry.user_name || entry.user_email || 'Usuario eliminado'}</p></div><time className="text-xs text-gray-600">{formatDate(entry.created_at)}</time></div>
        {fields.length > 0 && <div className="mt-4 grid gap-2 sm:grid-cols-2">{fields.map((field) => {
          const before = formatValue(field, entry.before?.[field])
          const after = formatValue(field, entry.after?.[field])
          return <div key={field} className="rounded-lg border border-gray-800 bg-dark-800/60 p-3"><p className="text-xs font-medium text-gray-400">{FIELD[field] ?? field.replace(/_/g, ' ')}</p>{entry.action === 'created' ? <p className="mt-1 text-sm text-gray-200">{after}</p> : <div className="mt-1 flex flex-wrap items-center gap-2 text-sm"><span className="text-gray-500">{before}</span><span aria-hidden="true" className="text-primary-500">→</span><span className="font-medium text-gray-200">{after}</span></div>}</div>
        })}</div>}
      </article>
    })}{!visible.length && <p className="py-10 text-center text-sm text-gray-500">Aún no hay movimientos para mostrar.</p>}</div></section>
  </div>
}
