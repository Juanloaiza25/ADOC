import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authService } from '../services/authService'
import { useAuthStore } from '@/app/store/useAuthStore'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const setUser = useAuthStore((state) => state.setUser)
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { user } = await authService.login({ email, password })
      setUser(user)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setError(null)
    setIsLoading(true)
    try {
      const { user } = await authService.login({ email: 'demo@adoc.app', password: 'DemoADOC2026!' })
      setUser(user)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo abrir la demo')
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = 'w-full px-4 py-3 bg-dark-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors'

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-dark-900/60 backdrop-blur border border-gray-800 rounded-2xl p-8 shadow-glow-sm">
        <h2 className="text-2xl font-bold text-white mb-2">
          Iniciar sesión
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Accede a tu cuenta para gestionar el cumplimiento de tu pyme
        </p>

        {error && (
          <div
            className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="tu@email.com"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              required
              autoComplete="current-password"
            />
            <Link to="/forgot-password" className="mt-2 block text-right text-xs text-primary-400 hover:text-primary-300">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed text-dark-950 font-semibold rounded-xl transition-all shadow-glow-sm"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <div className="my-5 flex items-center gap-3 text-xs text-gray-600">
          <span className="h-px flex-1 bg-gray-800" />
          o prueba el producto
          <span className="h-px flex-1 bg-gray-800" />
        </div>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => void handleDemoLogin()}
          className="w-full rounded-xl border border-primary-500/40 bg-primary-500/10 px-4 py-3 font-semibold text-primary-400 transition hover:bg-primary-500/20 disabled:opacity-50"
        >
          Entrar como usuario demo
        </button>
        <p className="mt-2 text-center text-xs text-gray-600">
          Incluye empresa, checklist y formulario precargados.
        </p>
        <p className="mt-6 text-center text-sm text-gray-500">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}
