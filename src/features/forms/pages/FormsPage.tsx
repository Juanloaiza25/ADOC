import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useProfile } from '@/features/users/hooks/useProfile'
import { formService } from '../services/formService'
import type { FormField, RegulatoryForm } from '@/shared/types/database'

export function FormsPage() {
  const { profile, isLoading: profileLoading } = useProfile()
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<RegulatoryForm | null>(null)
  const [values, setValues] = useState<Record<string, string | number>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const formsQuery = useQuery({ queryKey: ['regulatory-forms'], queryFn: formService.list })
  useEffect(() => { if (!selected && formsQuery.data?.length) setSelected(formsQuery.data[0]) }, [formsQuery.data, selected])

  const submissionQuery = useQuery({
    queryKey: ['form-submission', profile?.company_id, selected?.id],
    queryFn: () => formService.getSubmission(profile!.company_id!, selected!.id),
    enabled: Boolean(profile?.company_id && selected?.id),
  })

  useEffect(() => { setValues(submissionQuery.data?.data ?? {}) }, [submissionQuery.data, selected?.id])

  const persist = async (submit: boolean) => {
    const companyId = profile?.company_id
    if (!companyId || !selected) return
    setMessage(null)
    const missing = selected.schema.fields.find((field) => field.required && String(values[field.name] ?? '').trim() === '')
    if (submit && missing) return setMessage(`Completa el campo obligatorio: ${missing.label}`)
    setIsSaving(true)
    try {
      if (submit) await formService.submit(companyId, selected.id, values)
      else await formService.saveDraft(companyId, selected.id, values)
      await queryClient.invalidateQueries({ queryKey: ['form-submission', companyId, selected.id] })
      setMessage(submit ? 'Formulario enviado correctamente' : 'Borrador guardado')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo guardar el formulario')
    } finally {
      setIsSaving(false)
    }
  }

  const renderField = (field: FormField) => {
    const common = { id: field.name, required: field.required, value: values[field.name] ?? '', onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setValues((current) => ({ ...current, [field.name]: event.target.value })), className: 'w-full rounded-lg border border-gray-700 bg-dark-800 px-3 py-2 text-white placeholder-gray-600 focus:border-primary-500 focus:outline-none' }
    if (field.type === 'textarea') return <textarea {...common} rows={4} placeholder={field.placeholder} />
    if (field.type === 'select') return <select {...common}><option value="">Seleccionar</option>{field.options?.map((option) => <option key={option} value={option}>{option}</option>)}</select>
    return <input {...common} type={field.type} placeholder={field.placeholder} />
  }

  if (profileLoading || formsQuery.isLoading) return <div className="flex justify-center py-24"><div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" /></div>
  if (!profile?.company_id) return <div className="py-16 text-center text-gray-400">Primero debes <Link to="/dashboard" className="text-primary-400">registrar tu empresa</Link>.</div>
  if (formsQuery.error) return <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">{formsQuery.error.message}</div>
  if (!selected) return <div className="py-16 text-center text-gray-400">Todavía no hay formularios activos.</div>

  return (
    <div className="space-y-6">
      <header><Link to="/dashboard" className="text-sm text-primary-400">← Dashboard</Link><h1 className="mt-3 text-2xl font-bold text-white">Formularios normativos</h1><p className="mt-1 text-gray-400">Guarda borradores y completa la documentación de tu empresa.</p></header>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-2">{formsQuery.data?.map((form) => <button key={form.id} type="button" onClick={() => setSelected(form)} className={`w-full rounded-xl border p-4 text-left ${selected.id === form.id ? 'border-primary-500/50 bg-primary-500/10' : 'border-gray-800 bg-dark-900/50 hover:border-gray-700'}`}><span className="block text-xs font-semibold text-primary-400">{form.regulation?.code}</span><span className="mt-1 block font-medium text-white">{form.name}</span></button>)}</aside>
        <section className="rounded-2xl border border-gray-800 bg-dark-900/60 p-6">
          <div className="mb-6"><h2 className="text-xl font-semibold text-white">{selected.name}</h2><p className="mt-1 text-sm text-gray-400">{selected.description}</p>{submissionQuery.data && <span className="mt-3 inline-block rounded-full bg-dark-800 px-3 py-1 text-xs text-gray-400">Estado: {submissionQuery.data.status}</span>}</div>
          <form onSubmit={(event) => { event.preventDefault(); void persist(true) }} className="space-y-5">
            {selected.schema.fields.map((field) => <div key={field.name}><label htmlFor={field.name} className="mb-1 block text-sm font-medium text-gray-300">{field.label}{field.required && ' *'}</label>{renderField(field)}</div>)}
            {message && <p aria-live="polite" className="text-sm text-gray-400">{message}</p>}
            <div className="flex flex-wrap gap-3"><button type="button" disabled={isSaving} onClick={() => void persist(false)} className="rounded-lg border border-gray-700 px-4 py-2 text-gray-300 hover:border-primary-500 disabled:opacity-50">Guardar borrador</button><button type="submit" disabled={isSaving} className="rounded-lg bg-primary-500 px-4 py-2 font-semibold text-dark-950 hover:bg-primary-400 disabled:opacity-50">Enviar formulario</button></div>
          </form>
        </section>
      </div>
    </div>
  )
}
