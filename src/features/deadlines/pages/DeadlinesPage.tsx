import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deadlineService, type DeadlineType } from '../services/deadlineService'

const TYPE: Record<DeadlineType, string> = { document: 'Documento', registration: 'Registro sanitario', training: 'Capacitación', inspection: 'Inspección', other: 'Otro' }

export function DeadlinesPage() {
  const queryClient = useQueryClient()
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'document' as DeadlineType, dueDate: '', notes: '' })
  const data = useQuery({ queryKey: ['deadlines'], queryFn: deadlineService.get })
  const create = useMutation({ mutationFn: deadlineService.create, onSuccess: () => { setCreating(false); setForm({ title: '', type: 'document', dueDate: '', notes: '' }); void queryClient.invalidateQueries({ queryKey: ['deadlines'] }) } })
  const complete = useMutation({ mutationFn: (id: string) => deadlineService.update(id, { status: 'completed' }), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['deadlines'] }) })
  const today = new Date().toISOString().slice(0, 10)
  const soon = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
  const entries = useMemo(() => [
    ...(data.data?.deadlines.filter((item) => item.status === 'pending').map((item) => ({ ...item, source: 'deadline' as const })) ?? []),
    ...(data.data?.actionDeadlines ?? []),
  ].sort((a, b) => a.due_date.localeCompare(b.due_date)), [data.data])
  const classify = (date: string) => date < today ? 'overdue' : date <= soon ? 'soon' : 'upcoming'

  if (data.isLoading) return <div className="flex justify-center py-24"><div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" /></div>
  return <div className="space-y-7"><header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><Link to="/dashboard" className="text-sm text-primary-400">← Dashboard</Link><h1 className="mt-3 text-2xl font-bold text-white">Calendario y vencimientos</h1><p className="mt-1 text-gray-400">Controla renovaciones, documentos, capacitaciones y acciones.</p></div><button onClick={() => setCreating((value) => !value)} className="rounded-lg bg-primary-500 px-4 py-2 font-semibold text-dark-950">{creating ? 'Cancelar' : 'Nuevo vencimiento'}</button></header>
    {creating && <form onSubmit={(event) => { event.preventDefault(); create.mutate(form) }} className="grid gap-4 rounded-2xl border border-primary-500/30 bg-dark-900/50 p-5 md:grid-cols-2"><label className="text-sm text-gray-300">Nombre<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-700 bg-dark-800 px-3 py-2 text-white" /></label><label className="text-sm text-gray-300">Fecha<input required type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-700 bg-dark-800 px-3 py-2 text-white" /></label><label className="text-sm text-gray-300">Tipo<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as DeadlineType })} className="mt-1 w-full rounded-lg border border-gray-700 bg-dark-800 px-3 py-2 text-white">{Object.entries(TYPE).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="text-sm text-gray-300">Notas<input value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-700 bg-dark-800 px-3 py-2 text-white" /></label><button disabled={create.isPending} className="rounded-lg bg-primary-500 px-4 py-2 font-semibold text-dark-950 md:col-span-2">Guardar vencimiento</button></form>}
    {create.error && <p className="text-sm text-red-400">{create.error.message}</p>}
    <section className="grid gap-4 md:grid-cols-3">{(['overdue', 'soon', 'upcoming'] as const).map((group) => <div key={group} className="rounded-2xl border border-gray-800 bg-dark-900/50 p-4"><h2 className={`font-semibold ${group === 'overdue' ? 'text-red-400' : group === 'soon' ? 'text-amber-300' : 'text-primary-400'}`}>{group === 'overdue' ? 'Vencidos' : group === 'soon' ? 'Próximos 30 días' : 'Más adelante'} <span className="text-gray-600">({entries.filter((item) => classify(item.due_date) === group).length})</span></h2><div className="mt-3 space-y-3">{entries.filter((item) => classify(item.due_date) === group).map((item) => <article key={`${item.source}-${item.id}`} className="rounded-xl bg-dark-800/70 p-3"><p className="text-sm font-medium text-white">{item.title}</p><p className="mt-1 text-xs text-gray-500">{new Date(`${item.due_date}T00:00:00`).toLocaleDateString('es-CO')} · {item.source === 'deadline' ? TYPE[item.type] : 'Acción correctiva'}</p>{item.source === 'deadline' ? <button disabled={complete.isPending} onClick={() => complete.mutate(item.id)} className="mt-2 text-xs text-primary-400">Marcar completado</button> : <Link to="/actions" className="mt-2 block text-xs text-primary-400">Ver acción →</Link>}</article>)}</div></div>)}</section>
    {!!data.data?.deadlines.filter((item) => item.status === 'completed').length && <section className="rounded-2xl border border-gray-800 bg-dark-900/50 p-5"><h2 className="font-semibold text-white">Completados recientemente</h2><div className="mt-3 flex flex-wrap gap-2">{data.data.deadlines.filter((item) => item.status === 'completed').slice(0, 8).map((item) => <span key={item.id} className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">✓ {item.title}</span>)}</div></section>}
  </div>
}
