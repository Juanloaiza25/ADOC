import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationService } from '../services/notificationService'

const DOT_CLASS = { info: 'bg-primary-400', warning: 'bg-amber-400', critical: 'bg-red-400' }

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['notifications'], queryFn: notificationService.get, refetchInterval: 60_000 })
  const notifications = query.data?.notifications ?? []
  const unread = query.data?.unread ?? 0
  const markRead = async (keys: string[]) => {
    await notificationService.markRead(keys)
    await queryClient.invalidateQueries({ queryKey: ['notifications'] })
  }

  return <div className="relative">
    <button type="button" onClick={() => { setOpen((value) => !value); void query.refetch() }} aria-label={`Notificaciones${unread ? `, ${unread} sin leer` : ''}`} aria-expanded={open} className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-800 bg-dark-900 text-gray-400 hover:border-gray-700 hover:text-white">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17H9m9-2V11a6 6 0 10-12 0v4l-2 2h16l-2-2zm-8 5h4" /></svg>
      {unread > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{unread > 9 ? '9+' : unread}</span>}
    </button>
    {open && <div className="absolute right-0 z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-gray-800 bg-dark-900 shadow-2xl shadow-black/40">
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3"><div><h2 className="text-sm font-semibold text-white">Notificaciones</h2><p className="text-xs text-gray-500">{unread ? `${unread} sin leer` : 'Todo al día'}</p></div>{unread > 0 && <button type="button" onClick={() => void markRead(notifications.filter((item) => !item.read).map((item) => item.key))} className="text-xs text-primary-400 hover:text-primary-300">Marcar todas</button>}</div>
      <div className="max-h-96 overflow-y-auto">{notifications.map((item) => <Link key={item.key} to={item.href} onClick={() => { setOpen(false); if (!item.read) void markRead([item.key]) }} className={`flex gap-3 border-b border-gray-800/70 px-4 py-3 transition hover:bg-dark-800 ${item.read ? 'opacity-60' : ''}`}><span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${DOT_CLASS[item.severity]}`} /><span className="min-w-0"><strong className="block truncate text-sm font-medium text-gray-200">{item.title}</strong><span className={`mt-0.5 block text-xs ${item.severity === 'critical' ? 'text-red-300' : item.severity === 'warning' ? 'text-amber-300' : 'text-gray-500'}`}>{item.message}</span><span className="mt-1 block text-[11px] text-gray-600">{item.source === 'deadline' ? 'Vencimiento' : 'Acción correctiva'} · {new Date(`${item.dueDate}T00:00:00`).toLocaleDateString('es-CO')}</span></span></Link>)}{!notifications.length && <div className="px-6 py-10 text-center"><p className="text-2xl">✓</p><p className="mt-2 text-sm text-gray-400">No tienes alertas próximas.</p></div>}</div>
      <Link to="/deadlines" onClick={() => setOpen(false)} className="block px-4 py-3 text-center text-xs font-medium text-primary-400 hover:bg-dark-800">Ver calendario completo</Link>
    </div>}
  </div>
}
