import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '../services/authService'

export function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    if (password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres')
    if (password !== confirmation) return setError('Las contraseñas no coinciden')
    setIsLoading(true)
    try {
      await authService.updatePassword(password)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la contraseña')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-gray-800 bg-dark-900/60 p-8 shadow-glow-sm">
        <h1 className="text-2xl font-bold text-white">Nueva contraseña</h1>
        <p className="mb-6 mt-2 text-sm text-gray-400">Crea una contraseña de al menos 8 caracteres.</p>
        {success ? (
          <div><div role="status" className="rounded-xl border border-primary-500/30 bg-primary-500/10 p-4 text-sm text-primary-300">Tu contraseña fue actualizada correctamente.</div><Link to="/dashboard" className="mt-5 block text-center text-primary-400">Ir al dashboard</Link></div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>}
            <div><label htmlFor="new-password" className="mb-1 block text-sm font-medium text-gray-300">Contraseña nueva</label><input id="new-password" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-gray-700 bg-dark-800 px-4 py-3 text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500" /></div>
            <div><label htmlFor="confirm-password" className="mb-1 block text-sm font-medium text-gray-300">Confirmar contraseña</label><input id="confirm-password" type="password" required minLength={8} autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="w-full rounded-xl border border-gray-700 bg-dark-800 px-4 py-3 text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500" /></div>
            <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-primary-500 px-4 py-3 font-semibold text-dark-950 transition hover:bg-primary-400 disabled:opacity-50">{isLoading ? 'Actualizando...' : 'Actualizar contraseña'}</button>
          </form>
        )}
      </div>
    </div>
  )
}
