import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useAuthStore } from '@/app/store/useAuthStore'
import { authService } from '@/features/auth/services/authService'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const setUser = useAuthStore((s) => s.setUser)
  const setLoading = useAuthStore((s) => s.setLoading)

  useEffect(() => {
    authService.getSession()
      .then((session) => setUser(session?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [setUser, setLoading])

  return <>{children}</>
}
