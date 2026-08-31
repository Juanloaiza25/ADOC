import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useProfile } from '@/features/users/hooks/useProfile'
import { teamService, type TeamRole } from '../services/teamService'

const ROLE_LABEL: Record<TeamRole, string> = { owner: 'Propietario', admin: 'Administrador', auditor: 'Auditor', collaborator: 'Colaborador' }

export function TeamPage() {
  const { profile } = useProfile()
  const [params] = useSearchParams()
  const inviteToken = params.get('invite')
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'auditor' | 'collaborator'>('collaborator')
  const [message, setMessage] = useState<string | null>(null)
  const team = useQuery({ queryKey: ['team'], queryFn: teamService.get })
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['team'] })
  const invite = useMutation({ mutationFn: () => teamService.invite(email, role), onSuccess: () => { setEmail(''); setMessage('Invitación creada. Copia el enlace y compártelo con la persona.'); void refresh() } })
  const update = useMutation({ mutationFn: ({ id, nextRole }: { id: string; nextRole: TeamRole }) => teamService.updateRole(id, nextRole), onSuccess: () => { setMessage('Rol actualizado.'); void refresh() } })
  const remove = useMutation({ mutationFn: teamService.removeMember, onSuccess: () => { setMessage('El miembro fue retirado del equipo. Su cuenta personal no fue eliminada.'); void refresh(); void queryClient.invalidateQueries({ queryKey: ['audit'] }) } })
  const accept = useMutation({ mutationFn: (token: string) => teamService.accept(token), onSuccess: () => { setMessage('Invitación aceptada. Tu cuenta ya pertenece al equipo.'); void queryClient.invalidateQueries() } })

  useEffect(() => { if (inviteToken && !accept.isPending && !accept.isSuccess && !accept.isError) accept.mutate(inviteToken) }, [inviteToken, accept])
  const copyInvite = async (token: string) => { await navigator.clipboard.writeText(`${window.location.origin}/team?invite=${token}`); setMessage('Enlace de invitación copiado.') }
  const confirmRemove = (id: string, name: string) => {
    if (window.confirm(`¿Retirar a ${name} del equipo? Perderá el acceso a la empresa, pero su cuenta no será eliminada.`)) remove.mutate(id)
  }
  const error = invite.error || accept.error || update.error || remove.error

  if (team.isLoading) return <div className="flex justify-center py-24"><div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" /></div>
  return <div className="space-y-7">
    <header><Link to="/dashboard" className="text-sm text-primary-400">← Dashboard</Link><h1 className="mt-3 text-2xl font-bold text-white">Equipo y permisos</h1><p className="mt-1 text-gray-400">Administra quién puede colaborar, auditar o gestionar la empresa.</p></header>
    {(message || error) && <div className={`rounded-xl border p-4 text-sm ${error ? 'border-red-500/30 bg-red-500/10 text-red-400' : 'border-primary-500/30 bg-primary-500/10 text-primary-300'}`}>{error?.message || message}</div>}
    {team.data?.canManage && <form onSubmit={(event) => { event.preventDefault(); setMessage(null); invite.mutate() }} className="flex flex-col gap-3 rounded-2xl border border-gray-800 bg-dark-900/50 p-5 md:flex-row md:items-end">
      <label className="flex-1 text-sm text-gray-300">Correo<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="persona@empresa.com" className="mt-1 w-full rounded-lg border border-gray-700 bg-dark-800 px-3 py-2 text-white" /></label>
      <label className="text-sm text-gray-300">Rol<select value={role} onChange={(event) => setRole(event.target.value as typeof role)} className="mt-1 w-full rounded-lg border border-gray-700 bg-dark-800 px-3 py-2 text-white"><option value="collaborator">Colaborador</option><option value="auditor">Auditor</option><option value="admin">Administrador</option></select></label>
      <button disabled={invite.isPending} className="rounded-lg bg-primary-500 px-4 py-2 font-semibold text-dark-950 disabled:opacity-50">Invitar</button>
    </form>}
    <section className="rounded-2xl border border-gray-800 bg-dark-900/50 p-5"><h2 className="font-semibold text-white">Miembros ({team.data?.members.length ?? 0})</h2><div className="mt-4 divide-y divide-gray-800">
      {team.data?.members.map((member) => <div key={member.id} className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"><div><p className="text-sm font-medium text-white">{member.full_name || member.email}{member.id === profile?.id && <span className="ml-2 text-xs text-primary-400">Tú</span>}</p><p className="text-xs text-gray-500">{member.email} · {ROLE_LABEL[member.role]}</p></div>{team.data.canManage ? <div className="flex flex-wrap gap-2"><select aria-label={`Rol de ${member.email}`} value={member.role} disabled={update.isPending} onChange={(event) => update.mutate({ id: member.id, nextRole: event.target.value as TeamRole })} className="rounded-lg border border-gray-700 bg-dark-800 px-3 py-2 text-sm text-white"><option value="owner">Propietario</option><option value="admin">Administrador</option><option value="auditor">Auditor</option><option value="collaborator">Colaborador</option></select>{member.id !== profile?.id && <button type="button" disabled={remove.isPending} onClick={() => confirmRemove(member.id, member.full_name || member.email)} className="rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10 disabled:opacity-50">Retirar</button>}</div> : <span className="text-sm text-gray-400">{ROLE_LABEL[member.role]}</span>}</div>)}
    </div></section>
    {!!team.data?.invitations.length && <section className="rounded-2xl border border-gray-800 bg-dark-900/50 p-5"><h2 className="font-semibold text-white">Invitaciones pendientes</h2><div className="mt-4 divide-y divide-gray-800">{team.data.invitations.map((item) => <div key={item.id} className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"><div><p className="text-sm text-gray-200">{item.email}</p><p className="text-xs text-gray-500">{ROLE_LABEL[item.role]} · vence {new Date(item.expires_at).toLocaleDateString('es-CO')}</p></div><button type="button" onClick={() => void copyInvite(item.token)} className="rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-300 hover:border-primary-500">Copiar enlace</button></div>)}</div></section>}
  </div>
}
