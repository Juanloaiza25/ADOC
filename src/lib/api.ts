export const API_URL = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://127.0.0.1:8787' : '')).replace(/\/$/, '')

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: options.body instanceof FormData ? options.headers : { 'Content-Type': 'application/json', ...options.headers },
  })
  if (response.status === 204) return undefined as T
  const data = await response.json().catch(() => ({})) as T & { error?: string }
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`)
  return data
}
