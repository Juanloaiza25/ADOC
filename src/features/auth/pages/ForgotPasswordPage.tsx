import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '../services/authService'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await authService.requestPasswordReset(email.trim())
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el correo')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-gray-800 bg-dark-900/60 p-8 shadow-glow-sm">
        <h1 className="text-2xl font-bold text-white">Recuperar contraseña</h1>
        <p className="mb-6 mt-2 text-sm text-gray-400">Te enviaremos un enlace seguro para crear una contraseña nueva.</p>
        {sent ? (
          <div role="status" className="rounded-xl border border-primary-500/30 bg-primary-500/10 p-4 text-sm text-primary-300">
            Si existe una cuenta con ese correo, recibirás las instrucciones en unos minutos.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>}
            <div>
              <label htmlFor="reset-email" className="mb-1 block text-sm font-medium text-gray-300">Email</label>
              <input id="reset-email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-gray-700 bg-dark-800 px-4 py-3 text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-primary-500 px-4 py-3 font-semibold text-dark-950 transition hover:bg-primary-400 disabled:opacity-50">{isLoading ? 'Enviando...' : 'Enviar enlace'}</button>
          </form>
        )}
        <Link to="/login" className="mt-6 block text-center text-sm text-primary-400 hover:text-primary-300">Volver al inicio de sesión</Link>
      </div>
    </div>
  )
}
