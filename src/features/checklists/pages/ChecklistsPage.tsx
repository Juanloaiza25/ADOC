import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useProfile } from '@/features/users/hooks/useProfile'
import { useCompany } from '@/features/companies/hooks/useCompany'
import { checklistService } from '../services/checklistService'
import { actionService } from '@/features/actions/services/actionService'
import type { Checklist, ChecklistItemResponse, ChecklistResponseStatus } from '@/shared/types/database'
import { downloadCsv, openPrintableReport, safeFileName } from '@/lib/export'

const STATUS_OPTIONS: Array<{ value: ChecklistResponseStatus; label: string }> = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'compliant', label: 'Cumple' },
  { value: 'non_compliant', label: 'No cumple' },
  { value: 'not_applicable', label: 'No aplica' },
]

export function ChecklistsPage() {
  const { profile, isLoading: profileLoading } = useProfile()
  const { company } = useCompany(profile?.company_id)
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<Checklist | null>(null)
  const [companyChecklistId, setCompanyChecklistId] = useState<string | null>(null)
  const [savingItem, setSavingItem] = useState<string | null>(null)
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<string | null>(null)

  const catalogQuery = useQuery({
    queryKey: ['checklist-catalog'],
    queryFn: checklistService.listCatalog,
  })

  useEffect(() => {
    if (!selected && catalogQuery.data?.length) setSelected(catalogQuery.data[0])
  }, [catalogQuery.data, selected])

  const instanceQuery = useQuery({
    queryKey: ['company-checklist', profile?.company_id, selected?.id],
    queryFn: () => checklistService.getOrCreateCompanyChecklist(profile!.company_id!, selected!.id),
    enabled: Boolean(profile?.company_id && selected?.id),
  })

  useEffect(() => {
    setCompanyChecklistId(instanceQuery.data?.id ?? null)
  }, [instanceQuery.data?.id])

  const responsesQuery = useQuery({
    queryKey: ['checklist-responses', companyChecklistId],
    queryFn: () => checklistService.listResponses(companyChecklistId!),
    enabled: Boolean(companyChecklistId),
  })

  const responses = useMemo(
    () => new Map((responsesQuery.data ?? []).map((response) => [response.checklist_item_id, response])),
    [responsesQuery.data],
  )

  const answered = selected?.items.filter((item) => {
    const status = responses.get(item.id)?.status
    return status && status !== 'pending'
  }).length ?? 0
  const progress = selected?.items.length ? Math.round((answered / selected.items.length) * 100) : 0

  const exportRows = () => (selected?.items ?? []).map((item) => {
    const response = responses.get(item.id)
    const status = STATUS_OPTIONS.find((option) => option.value === (response?.status ?? 'pending'))?.label ?? 'Pendiente'
    return {
      title: item.title,
      description: item.description ?? '',
      required: item.required ? 'Sí' : 'No',
      status,
      notes: notesDraft[item.id] ?? response?.notes ?? '',
      evidence: response?.evidence_url ? 'Adjunta' : 'Sin evidencia',
    }
  })

  const exportChecklistCsv = () => {
    if (!selected) return
    const rows = exportRows()
    downloadCsv(
      `checklist-${safeFileName(selected.name)}.csv`,
      ['Requisito', 'Descripción', 'Obligatorio', 'Estado', 'Notas', 'Evidencia'],
      rows.map((row) => [row.title, row.description, row.required, row.status, row.notes, row.evidence]),
    )
  }

  const printChecklist = () => {
    if (!selected) return
    const opened = openPrintableReport({
      title: selected.name,
      subtitle: selected.regulation ? `${selected.regulation.code} · ${selected.regulation.name}` : undefined,
      company: company?.name,
      summary: `Avance: ${progress}% · ${answered} de ${selected.items.length} requisitos evaluados`,
      rows: exportRows().map((row) => ({
        label: row.title,
        detail: [row.description, row.notes && `Notas: ${row.notes}`, `Evidencia: ${row.evidence}`].filter(Boolean).join('\n'),
        value: row.status,
      })),
    })
    if (!opened) setMessage('El navegador bloqueó la ventana de impresión. Habilita las ventanas emergentes para ADOC.')
  }

  const saveStatus = async (itemId: string, status: ChecklistResponseStatus) => {
    if (!companyChecklistId) return
    const notes = notesDraft[itemId] ?? responses.get(itemId)?.notes ?? ''
    setSavingItem(itemId)
    setMessage(null)
    try {
      const result = await checklistService.saveResponse({
        companyChecklistId,
        itemId,
        status,
        notes,
      })
      queryClient.setQueryData<ChecklistItemResponse[]>(['checklist-responses', companyChecklistId], (current = []) => {
        const existing = current.find((response) => response.checklist_item_id === itemId)
        const updated: ChecklistItemResponse = {
          id: existing?.id ?? `local-${itemId}`,
          company_checklist_id: companyChecklistId,
          checklist_item_id: itemId,
          status,
          notes,
          evidence_url: existing?.evidence_url ?? null,
          evidence_key: existing?.evidence_key ?? null,
        }
        return existing
          ? current.map((response) => response.checklist_item_id === itemId ? updated : response)
          : [...current, updated]
      })
      queryClient.setQueryData(['company-checklist', profile?.company_id, selected?.id], (current: Record<string, unknown> | undefined) => current ? { ...current, progress_percent: result.progress } : current)
      void queryClient.invalidateQueries({ queryKey: ['checklist-responses', companyChecklistId] })
      setMessage(`Progreso guardado: ${result.progress}%`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo guardar el progreso')
    } finally {
      setSavingItem(null)
    }
  }

  const saveNotes = async (itemId: string) => {
    await saveStatus(itemId, responses.get(itemId)?.status ?? 'pending')
  }

  const uploadEvidence = async (itemId: string, file: File) => {
    const companyId = profile?.company_id
    if (!companyChecklistId || !companyId) return
    if (file.size > 10 * 1024 * 1024) {
      setMessage('El archivo no puede superar 10 MB')
      return
    }
    setSavingItem(itemId)
    setMessage(null)
    try {
      await checklistService.uploadEvidence({
        companyId,
        companyChecklistId,
        itemId,
        status: responses.get(itemId)?.status ?? 'pending',
        notes: notesDraft[itemId] ?? responses.get(itemId)?.notes ?? '',
        file,
      })
      await queryClient.invalidateQueries({ queryKey: ['checklist-responses', companyChecklistId] })
      setMessage('Evidencia cargada correctamente')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo cargar la evidencia')
    } finally {
      setSavingItem(null)
    }
  }

  const openEvidence = async (path: string) => {
    try {
      const url = await checklistService.getEvidenceUrl(path)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo abrir la evidencia')
    }
  }

  const createCorrectiveAction = async (itemId: string, title: string) => {
    const response = responses.get(itemId)
    if (!response) return
    setSavingItem(itemId)
    setMessage(null)
    try {
      await actionService.create({ checklistResponseId: response.id, title: `Corregir: ${title}`, description: notesDraft[itemId] ?? response.notes ?? '', priority: 'high' })
      await queryClient.invalidateQueries({ queryKey: ['actions'] })
      setMessage('Acción correctiva creada. Puedes gestionarla desde el menú Acciones.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo crear la acción')
    } finally {
      setSavingItem(null)
    }
  }

  if (profileLoading || catalogQuery.isLoading) {
    return <div className="flex justify-center py-24"><div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" /></div>
  }

  if (!profile?.company_id) {
    return <div className="py-16 text-center text-gray-400">Primero debes <Link className="text-primary-400" to="/dashboard">registrar tu empresa</Link>.</div>
  }

  if (catalogQuery.error) {
    return <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">No se pudieron cargar los checklists: {catalogQuery.error.message}</div>
  }

  if (!selected) {
    return <div className="py-16 text-center text-gray-400">Todavía no hay checklists activos.</div>
  }

  return (
    <div className="space-y-6">
      <header>
        <Link to="/dashboard" className="text-sm text-primary-400 hover:text-primary-300">← Dashboard</Link>
        <h1 className="mt-3 text-2xl font-bold text-white">Checklists de cumplimiento</h1>
        <p className="mt-1 text-gray-400">Evalúa cada requisito y guarda el avance de tu empresa.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-2">
          {catalogQuery.data?.map((checklist) => (
            <button key={checklist.id} type="button" onClick={() => setSelected(checklist)} className={`w-full rounded-xl border p-4 text-left transition ${selected.id === checklist.id ? 'border-primary-500/50 bg-primary-500/10' : 'border-gray-800 bg-dark-900/50 hover:border-gray-700'}`}>
              <span className="block text-xs font-semibold uppercase tracking-wide text-primary-400">{checklist.regulation?.code}</span>
              <span className="mt-1 block font-medium text-white">{checklist.name}</span>
              <span className="mt-1 block text-xs text-gray-500">{checklist.items.length} requisitos</span>
            </button>
          ))}
        </aside>

        <section className="rounded-2xl border border-gray-800 bg-dark-900/60 p-5 sm:p-6">
          <div className="mb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div><h2 className="text-xl font-semibold text-white">{selected.name}</h2><p className="mt-1 text-sm text-gray-400">{selected.description}</p></div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={exportChecklistCsv} className="rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-300 hover:border-primary-500 hover:text-primary-400">Exportar CSV</button>
                <button type="button" onClick={printChecklist} className="rounded-lg bg-primary-500/10 px-3 py-2 text-sm font-medium text-primary-400 hover:bg-primary-500/20">Imprimir / PDF</button>
                <strong className="ml-1 text-primary-400">{progress}%</strong>
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-dark-800"><div className="h-full bg-primary-500 transition-all" style={{ width: `${progress}%` }} /></div>
            {message && <p aria-live="polite" className="mt-2 text-sm text-gray-400">{message}</p>}
          </div>

          <div className="space-y-3">
            {selected.items.map((item, index) => (
              <article key={item.id} className="rounded-xl border border-gray-800 bg-dark-950/50 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div><h3 className="font-medium text-white"><span className="mr-2 text-gray-600">{index + 1}.</span>{item.title}</h3>{item.description && <p className="mt-1 text-sm text-gray-400">{item.description}</p>}</div>
                  <select aria-label={`Estado de ${item.title}`} value={responses.get(item.id)?.status ?? 'pending'} disabled={savingItem === item.id || instanceQuery.isLoading} onChange={(event) => saveStatus(item.id, event.target.value as ChecklistResponseStatus)} className="min-w-36 rounded-lg border border-gray-700 bg-dark-800 px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none">
                    {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                  <textarea
                    aria-label={`Notas de ${item.title}`}
                    rows={2}
                    value={notesDraft[item.id] ?? responses.get(item.id)?.notes ?? ''}
                    onChange={(event) => setNotesDraft((current) => ({ ...current, [item.id]: event.target.value }))}
                    placeholder="Observaciones, hallazgos o acciones pendientes..."
                    className="resize-y rounded-lg border border-gray-700 bg-dark-800 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-primary-500 focus:outline-none"
                  />
                  <button type="button" disabled={savingItem === item.id} onClick={() => saveNotes(item.id)} className="self-end rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-300 hover:border-primary-500 hover:text-primary-400 disabled:opacity-50">Guardar nota</button>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <label className="cursor-pointer rounded-lg bg-dark-800 px-3 py-2 text-sm text-gray-300 hover:text-primary-400">
                    {savingItem === item.id ? 'Cargando...' : 'Adjuntar evidencia'}
                    <input type="file" className="sr-only" disabled={savingItem === item.id} accept="application/pdf,image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadEvidence(item.id, file); event.target.value = '' }} />
                  </label>
                  {responses.get(item.id)?.evidence_url && <button type="button" onClick={() => void openEvidence(responses.get(item.id)!.evidence_url!)} className="text-sm text-primary-400 hover:text-primary-300">Ver evidencia</button>}
                  {responses.get(item.id)?.status === 'non_compliant' && <button type="button" disabled={savingItem === item.id} onClick={() => void createCorrectiveAction(item.id, item.title)} className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300 hover:bg-red-500/20 disabled:opacity-50">Crear acción correctiva</button>}
                  <span className="text-xs text-gray-600">PDF, JPG, PNG o WebP · máximo 10 MB</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
