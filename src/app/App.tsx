import { BrowserRouter } from 'react-router-dom'
import { QueryProvider } from './providers/QueryProvider'
import { AuthProvider } from './providers/AuthProvider'
import { ThemeProvider } from './providers/ThemeProvider'
import { AppRouter } from './router/AppRouter'
import { isSupabaseConfigured } from '@/lib/supabase'

function App() {
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950 p-6">
        <div className="max-w-md w-full bg-dark-900 border border-gray-800 rounded-2xl p-8 text-center">
          <h1 className="text-xl font-bold text-white mb-2">
            Configuración requerida
          </h1>
          <p className="text-gray-400 mb-4">
            Copia <code className="bg-dark-800 px-2 py-1 rounded text-sm text-primary-400">.env.local</code> a <code className="bg-dark-800 px-2 py-1 rounded text-sm text-primary-400">.env</code> y configura:
          </p>
          <ul className="text-left text-sm text-gray-500 space-y-1 mb-6">
            <li>• VITE_SUPABASE_URL</li>
            <li>• VITE_SUPABASE_ANON_KEY</li>
          </ul>
          <p className="text-sm text-gray-500">
            Obtén las credenciales en tu proyecto de{' '}
            <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-primary-400 hover:text-primary-300">
              Supabase
            </a> → Settings → API
          </p>
        </div>
      </div>
    )
  }

  return (
    <QueryProvider>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </QueryProvider>
  )
}

export default App
