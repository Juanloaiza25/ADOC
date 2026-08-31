import type { Context, Next } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import type { AppVariables, Env } from './types'

const encoder = new TextEncoder()
const SESSION_DAYS = 30

function bytesToBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
}

function base64ToBytes(value: string) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0))
}

async function sha256(value: string) {
  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(value))
  return bytesToBase64(new Uint8Array(hash))
}

export async function hashPassword(password: string, salt = crypto.getRandomValues(new Uint8Array(16))) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100_000 }, key, 256)
  return `pbkdf2_sha256$100000$${bytesToBase64(salt)}$${bytesToBase64(new Uint8Array(bits))}`
}

export async function verifyPassword(password: string, stored: string) {
  const [algorithm, iterations, saltValue, expected] = stored.split('$')
  if (algorithm !== 'pbkdf2_sha256' || iterations !== '100000' || !saltValue || !expected) return false
  const actual = await hashPassword(password, base64ToBytes(saltValue))
  return actual === stored
}

export async function createSession(c: Context<{ Bindings: Env; Variables: AppVariables }>, userId: string) {
  const token = bytesToBase64(crypto.getRandomValues(new Uint8Array(32)))
    .replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
  const tokenHash = await sha256(token)
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000).toISOString()
  await c.env.DB.prepare('INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)')
    .bind(crypto.randomUUID(), userId, tokenHash, expiresAt).run()
  const isSecure = new URL(c.req.url).protocol === 'https:'
  setCookie(c, 'adoc_session', token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? 'None' : 'Lax',
    path: '/',
    maxAge: SESSION_DAYS * 86_400,
  })
}

export async function destroySession(c: Context<{ Bindings: Env; Variables: AppVariables }>) {
  const token = getCookie(c, 'adoc_session')
  if (token) await c.env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256(token)).run()
  deleteCookie(c, 'adoc_session', { path: '/' })
}

export async function requireAuth(c: Context<{ Bindings: Env; Variables: AppVariables }>, next: Next) {
  const token = getCookie(c, 'adoc_session')
  if (!token) return c.json({ error: 'Authentication required' }, 401)
  const session = await c.env.DB.prepare(
    `SELECT s.user_id FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash = ? AND s.expires_at > datetime('now') AND u.suspended_at IS NULL`,
  ).bind(await sha256(token)).first<{ user_id: string }>()
  if (!session) {
    deleteCookie(c, 'adoc_session', { path: '/' })
    return c.json({ error: 'Session expired' }, 401)
  }
  c.set('userId', session.user_id)
  await next()
}
