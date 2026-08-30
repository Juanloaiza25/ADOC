import { apiRequest } from '@/lib/api'

export interface AuthCredentials {
  email: string
  password: string
}

export interface RegisterCredentials extends AuthCredentials {
  name?: string
}

export const authService = {
  async login({ email, password }: AuthCredentials) {
    return apiRequest<{ user: { id: string; email: string; name?: string } }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
  },

  async register({ email, password, name }: RegisterCredentials) {
    return apiRequest<{ user: { id: string; email: string; name?: string } }>('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) })
  },

  async logout() {
    await apiRequest('/api/auth/logout', { method: 'POST' })
  },

  async getSession() {
    try { return await apiRequest<{ user: { id: string; email: string; name?: string } }>('/api/auth/session') } catch { return null }
  },

  async requestPasswordReset(email: string) {
    void email
    throw new Error('La recuperación por correo estará disponible después de migrar el servicio de email.')
  },

  async updatePassword(password: string) {
    void password
    throw new Error('El enlace de recuperación anterior ya no es válido. Crea una cuenta nueva en Cloudflare.')
  },
}
