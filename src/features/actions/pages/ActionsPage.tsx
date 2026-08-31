import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useProfile } from '@/features/users/hooks/useProfile'
import { teamService } from '@/features/team/services/teamService'
import { actionService } from '../services/actionService'
import type { ActionPriority, ActionStatus } from '@/shared/types/database'

const STATUS: Record<ActionStatus, string> = { open: 'Abierta', in_progress: 'En progreso', resolved: 'Resuelta', cancelled: 'Cancelada' }
const PRIORITY: Record<ActionPriority, string> = { low: 'Baja', medium: 'Media', high: 'Alta', critical: 'Crítica' }
const PRIORITY_CLASS: Record<ActionPriority, string> = { low: 'text-gray-400', medium: 'text-amber-300', high: 'text-orange-300', critical: 'text-red-300' }
const EMPTY_FORM = { title: '', description: '', dueDate: '', assignedTo: '', priority: 'medium' as ActionPriority }

export function ActionsPage() {
  const { profile } = useProfile()
  const readOnly = profile?.role === 'auditor'
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<'active' | 'resolved' | 'all'>('active')
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [message, setMessage] = useState<string | null>(null)
  const actions = useQuery({ queryKey: ['actions'], queryFn: actionService.list })
  const team = useQuery({ queryKey: ['team'], queryFn: teamService.get })
  const create = useMutation({
    mutationFn: actionService.create,
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['actions'] }); setCreating(false); setForm(EMPTY_FORM); setMessage('Acción creada') },
  })
  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof actionService.update>[1] }) => actionService.update(id, input),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['actions'] }),
  })
  const visible = useMemo(() => (actions.data ?? []).filter((action) => filter === 'all' || (filter === 'resolved' ? action.status === 'resolved' : ['open', 'in_progress'].includes(action.status))), [actions.data, filter])
  const isOverdue = (date: string | null, status: ActionStatus) => Boolean(date && !['resolved', 'cancelled'].includes(status) && date < new Date().toISOString().slice(0, 10))

  if (actions.isLoading) return <div className="flex justify-center py-24"><div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" /></div>
  return <div className="space-y-6">
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><Link to="/dashboard" className="text-sm text-primary-400">← Dashboard</Link><h1 className="mt-3 text-2xl font-bold text-white">Acciones correctivas</h1><p className="mt-1 text-gray-400">Convierte hallazgos en tareas verificables.</p></div>
      {!readOnly && <button type="button" onClick={() => setCreating((value) => !value)} className="rounded-lg bg-primary-500 px-4 py-2 font-semibold text-dark-950">{creating ? 'Cancelar' : 'Nueva acción'}</button>}
    </header>
    {!readOnly && creating && <form onSubmit={(event) => { event.preventDefault(); create.mutate({ ...form, dueDate: form.dueDate || undefined, assignedTo: form.assignedTo || undefined }) }} className="grid gap-4 rounded-2xl border border-primary-500/30 bg-dark-900/60 p-5 md:grid-cols-2">
      <label className="text-sm text-gray-300">Título<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-700 bg-dark-800 px-3 py-2 text-white" /></label>
      <label className="text-sm text-gray-300">Fecha límite<input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-700 bg-dark-800 px-3 py-2 text-white" /></label>
      <label className="text-sm text-gray-300 md:col-span-2">Descripción<textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-700 bg-dark-800 px-3 py-2 text-white" /></label>
      <label className="text-sm text-gray-300">Prioridad<select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as ActionPriority })} className="mt-1 w-full rounded-lg border border-gray-700 bg-dark-800 px-3 py-2 text-white">{Object.entries(PRIORITY).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label className="text-sm text-gray-300">Responsable<select value={form.assignedTo} onChange={(event) => setForm({ ...form, assignedTo: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-700 bg-dark-800 px-3 py-2 text-white"><option value="">Sin asignar</option>{team.data?.members.map((member) => <option key={member.id} value={member.id}>{member.full_name || member.email}</option>)}</select></label>
      <button disabled={create.isPending} className="rounded-lg bg-primary-500 px-4 py-2 font-semibold text-dark-950 md:col-span-2">{create.isPending ? 'Creando...' : 'Crear acción'}</button>
    </form>}
    {(message || create.error) && <p className={`text-sm ${create.error ? 'text-red-400' : 'text-primary-400'}`}>{create.error?.message || message}</p>}
    <div className="flex gap-2">{(['active', 'resolved', 'all'] as const).map((value) => <button key={value} onClick={() => setFilter(value)} className={`rounded-lg px-3 py-2 text-sm ${filter === value ? 'bg-primary-500/15 text-primary-400' : 'text-gray-500'}`}>{value === 'active' ? 'Activas' : value === 'resolved' ? 'Resueltas' : 'Todas'}</button>)}</div>
    <div className="grid gap-4">{visible.map((action) => <article key={action.id} className={`rounded-2xl border bg-dark-900/50 p-5 ${isOverdue(action.due_date, action.status) ? 'border-red-500/40' : 'border-gray-800'}`}>
      <div className="flex flex-col justify-between gap-4 md:flex-row"><div><div className="flex flex-wrap items-center gap-2"><span className={`text-xs font-semibold uppercase ${PRIORITY_CLASS[action.priority]}`}>{PRIORITY[action.priority]}</span><span className="rounded-full bg-dark-800 px-2 py-1 text-xs text-gray-400">{STATUS[action.status]}</span>{isOverdue(action.due_date, action.status) && <span className="text-xs text-red-400">Vencida</span>}</div><h2 className="mt-3 font-semibold text-white">{action.title}</h2>{action.description && <p className="mt-1 text-sm text-gray-400">{action.description}</p>}<p className="mt-2 text-xs text-gray-600">Vence: {action.due_date || 'Sin fecha'} · Responsable: {action.assignee_name || action.assignee_email || 'Sin asignar'}</p></div>
        <div className="flex flex-col gap-2"><select aria-label={`Estado de ${action.title}`} value={action.status} disabled={readOnly || update.isPending} onChange={(event) => update.mutate({ id: action.id, input: { status: event.target.value as ActionStatus } })} className="h-10 rounded-lg border border-gray-700 bg-dark-800 px-3 text-sm text-white disabled:opacity-60">{Object.entries(STATUS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>{!readOnly && <select aria-label={`Responsable de ${action.title}`} value={action.assigned_to ?? ''} disabled={update.isPending} onChange={(event) => update.mutate({ id: action.id, input: { assignedTo: event.target.value || null } })} className="h-10 rounded-lg border border-gray-700 bg-dark-800 px-3 text-sm text-white"><option value="">Sin asignar</option>{team.data?.members.map((member) => <option key={member.id} value={member.id}>{member.full_name || member.email}</option>)}</select>}</div>
      </div>
    </article>)}{!visible.length && <div className="rounded-2xl border border-dashed border-gray-800 py-12 text-center text-gray-500">No hay acciones en esta vista.</div>}</div>
  </div>
}
