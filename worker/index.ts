import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createSession, destroySession, hashPassword, requireAuth, verifyPassword } from './auth'
import type { AppVariables, Env } from './types'

const app = new Hono<{ Bindings: Env; Variables: AppVariables }>()

app.use('/api/*', async (c, next) => cors({
  origin: (origin) => c.env.APP_ORIGIN.split(',').includes(origin) ? origin : '',
  credentials: true,
  allowHeaders: ['Content-Type'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
})(c, next))

app.get('/api/health', (c) => c.json({ status: 'ok', service: 'adoc-api' }))

app.post('/api/auth/register', async (c) => {
  const body = await c.req.json<{ email?: string; password?: string; name?: string }>()
  const email = body.email?.trim().toLowerCase()
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return c.json({ error: 'Valid email required' }, 400)
  if (!body.password || body.password.length < 8) return c.json({ error: 'Password must have at least 8 characters' }, 400)
  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
  if (existing) return c.json({ error: 'Email already registered' }, 409)
  const id = crypto.randomUUID()
  await c.env.DB.prepare('INSERT INTO users (id, email, password_hash, full_name) VALUES (?, ?, ?, ?)')
    .bind(id, email, await hashPassword(body.password), body.name?.trim() || null).run()
  await createSession(c, id)
  return c.json({ user: { id, email, name: body.name?.trim() || null } }, 201)
})

app.post('/api/auth/login', async (c) => {
  const body = await c.req.json<{ email?: string; password?: string }>()
  const user = await c.env.DB.prepare('SELECT id, email, full_name, password_hash FROM users WHERE email = ?')
    .bind(body.email?.trim().toLowerCase() ?? '').first<{ id: string; email: string; full_name: string | null; password_hash: string }>()
  if (!user || !body.password || !(await verifyPassword(body.password, user.password_hash))) {
    return c.json({ error: 'Invalid email or password' }, 401)
  }
  await createSession(c, user.id)
  return c.json({ user: { id: user.id, email: user.email, name: user.full_name } })
})

app.post('/api/auth/logout', requireAuth, async (c) => {
  await destroySession(c)
  return c.body(null, 204)
})

app.get('/api/auth/session', requireAuth, async (c) => {
  const user = await c.env.DB.prepare('SELECT id, email, full_name FROM users WHERE id = ?')
    .bind(c.get('userId')).first<{ id: string; email: string; full_name: string | null }>()
  return c.json({ user: user ? { id: user.id, email: user.email, name: user.full_name } : null })
})

app.get('/api/profile', requireAuth, async (c) => {
  const profile = await c.env.DB.prepare(
    'SELECT id, email, full_name, avatar_key, company_id, role, created_at, updated_at FROM users WHERE id = ?',
  ).bind(c.get('userId')).first()
  return c.json({ profile })
})

app.patch('/api/profile', requireAuth, async (c) => {
  const body = await c.req.json<{ full_name?: string }>()
  await c.env.DB.prepare("UPDATE users SET full_name = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(body.full_name?.trim() || null, c.get('userId')).run()
  return c.json({ ok: true })
})

app.post('/api/companies', requireAuth, async (c) => {
  const userId = c.get('userId')
  const user = await c.env.DB.prepare('SELECT company_id FROM users WHERE id = ?').bind(userId).first<{ company_id: string | null }>()
  if (user?.company_id) return c.json({ error: 'User already belongs to a company' }, 409)
  const body = await c.req.json<Record<string, string | undefined>>()
  if (!body.name?.trim()) return c.json({ error: 'Company name required' }, 400)
  const id = crypto.randomUUID()
  await c.env.DB.batch([
    c.env.DB.prepare('INSERT INTO companies (id, name, nit, address, city, department, phone, sector) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(id, body.name.trim(), body.nit || null, body.address || null, body.city || null, body.department || null, body.phone || null, body.sector || null),
    c.env.DB.prepare("UPDATE users SET company_id = ?, role = 'owner', updated_at = datetime('now') WHERE id = ? AND company_id IS NULL")
      .bind(id, userId),
  ])
  const company = await c.env.DB.prepare('SELECT * FROM companies WHERE id = ?').bind(id).first()
  return c.json({ company }, 201)
})

app.get('/api/company', requireAuth, async (c) => {
  const company = await c.env.DB.prepare('SELECT c.* FROM companies c JOIN users u ON u.company_id = c.id WHERE u.id = ?')
    .bind(c.get('userId')).first()
  return company ? c.json({ company }) : c.json({ company: null })
})

app.patch('/api/company', requireAuth, async (c) => {
  const body = await c.req.json<Record<string, string | undefined>>()
  const membership = await c.env.DB.prepare("SELECT company_id, role FROM users WHERE id = ? AND role IN ('owner', 'admin')")
    .bind(c.get('userId')).first<{ company_id: string; role: string }>()
  if (!membership?.company_id) return c.json({ error: 'Owner or admin role required' }, 403)
  if (!body.name?.trim()) return c.json({ error: 'Company name required' }, 400)
  await c.env.DB.prepare("UPDATE companies SET name=?, nit=?, address=?, city=?, department=?, phone=?, sector=?, updated_at=datetime('now') WHERE id=?")
    .bind(body.name.trim(), body.nit || null, body.address || null, body.city || null, body.department || null, body.phone || null, body.sector || null, membership.company_id).run()
  const company = await c.env.DB.prepare('SELECT * FROM companies WHERE id = ?').bind(membership.company_id).first()
  return c.json({ company })
})

app.get('/api/checklists', requireAuth, async (c) => {
  const { results: checklists } = await c.env.DB.prepare(`
    SELECT c.id, c.name, c.description, r.code regulation_code, r.name regulation_name
    FROM checklists c JOIN regulations r ON r.id = c.regulation_id WHERE c.active = 1 ORDER BY c.name
  `).all<Record<string, unknown>>()
  const { results: items } = await c.env.DB.prepare('SELECT * FROM checklist_items ORDER BY sort_order').all<Record<string, unknown>>()
  return c.json({ checklists: checklists.map((checklist) => ({ ...checklist, items: items.filter((item) => item.checklist_id === checklist.id) })) })
})

app.post('/api/company-checklists/:checklistId', requireAuth, async (c) => {
  const membership = await c.env.DB.prepare('SELECT company_id FROM users WHERE id = ?').bind(c.get('userId')).first<{ company_id: string | null }>()
  if (!membership?.company_id) return c.json({ error: 'Company required' }, 409)
  const checklistId = c.req.param('checklistId')
  let instance = await c.env.DB.prepare('SELECT * FROM company_checklists WHERE company_id=? AND checklist_id=?').bind(membership.company_id, checklistId).first()
  if (!instance) {
    const id = crypto.randomUUID()
    await c.env.DB.prepare('INSERT INTO company_checklists (id, company_id, checklist_id) VALUES (?, ?, ?)').bind(id, membership.company_id, checklistId).run()
    instance = await c.env.DB.prepare('SELECT * FROM company_checklists WHERE id=?').bind(id).first()
  }
  return c.json({ companyChecklist: instance })
})

app.get('/api/company-checklists/:id/responses', requireAuth, async (c) => {
  const allowed = await c.env.DB.prepare(`SELECT cc.id FROM company_checklists cc JOIN users u ON u.company_id=cc.company_id WHERE cc.id=? AND u.id=?`).bind(c.req.param('id'), c.get('userId')).first()
  if (!allowed) return c.json({ error: 'Not found' }, 404)
  const { results } = await c.env.DB.prepare('SELECT * FROM checklist_responses WHERE company_checklist_id=?').bind(c.req.param('id')).all()
  return c.json({ responses: results })
})

app.put('/api/company-checklists/:id/responses/:itemId', requireAuth, async (c) => {
  const companyChecklistId = c.req.param('id')
  const itemId = c.req.param('itemId')
  const allowed = await c.env.DB.prepare(`SELECT cc.id FROM company_checklists cc JOIN users u ON u.company_id=cc.company_id WHERE cc.id=? AND u.id=?`).bind(companyChecklistId, c.get('userId')).first()
  if (!allowed) return c.json({ error: 'Not found' }, 404)
  const body = await c.req.json<{ status?: string; notes?: string }>()
  if (!['compliant', 'non_compliant', 'not_applicable', 'pending'].includes(body.status ?? '')) return c.json({ error: 'Invalid status' }, 400)
  await c.env.DB.prepare(`INSERT INTO checklist_responses (id, company_checklist_id, checklist_item_id, status, notes, responded_by)
    VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(company_checklist_id, checklist_item_id) DO UPDATE SET status=excluded.status, notes=excluded.notes, responded_by=excluded.responded_by, updated_at=datetime('now')`)
    .bind(crypto.randomUUID(), companyChecklistId, itemId, body.status, body.notes?.trim() || null, c.get('userId')).run()
  const totals = await c.env.DB.prepare(`SELECT COUNT(ci.id) total, SUM(CASE WHEN cr.status IN ('compliant','non_compliant','not_applicable') THEN 1 ELSE 0 END) answered FROM company_checklists cc JOIN checklist_items ci ON ci.checklist_id=cc.checklist_id LEFT JOIN checklist_responses cr ON cr.company_checklist_id=cc.id AND cr.checklist_item_id=ci.id WHERE cc.id=?`).bind(companyChecklistId).first<{ total: number; answered: number }>()
  const progress = totals?.total ? Math.round((totals.answered ?? 0) * 100 / totals.total) : 0
  await c.env.DB.prepare("UPDATE company_checklists SET progress_percent=?, status=?, updated_at=datetime('now') WHERE id=?").bind(progress, progress === 100 ? 'completed' : 'in_progress', companyChecklistId).run()
  return c.json({ ok: true, progress })
})

app.post('/api/company-checklists/:id/responses/:itemId/evidence', requireAuth, async (c) => {
  const companyChecklistId = c.req.param('id')
  const itemId = c.req.param('itemId')
  const membership = await c.env.DB.prepare(`SELECT cc.company_id FROM company_checklists cc JOIN users u ON u.company_id=cc.company_id WHERE cc.id=? AND u.id=?`).bind(companyChecklistId, c.get('userId')).first<{ company_id: string }>()
  if (!membership) return c.json({ error: 'Not found' }, 404)
  const body = await c.req.parseBody()
  const file = body.file
  if (!(file instanceof File)) return c.json({ error: 'File required' }, 400)
  if (file.size > 10 * 1024 * 1024) return c.json({ error: 'Maximum file size is 10 MB' }, 413)
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) return c.json({ error: 'Unsupported file type' }, 415)
  const extension = file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'bin'
  const key = `${membership.company_id}/${companyChecklistId}/${itemId}/${crypto.randomUUID()}.${extension}`
  await c.env.EVIDENCE.put(key, file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { originalName: file.name } })
  await c.env.DB.prepare(`INSERT INTO checklist_responses (id, company_checklist_id, checklist_item_id, status, evidence_key, responded_by)
    VALUES (?, ?, ?, 'pending', ?, ?) ON CONFLICT(company_checklist_id, checklist_item_id) DO UPDATE SET evidence_key=excluded.evidence_key, responded_by=excluded.responded_by, updated_at=datetime('now')`)
    .bind(crypto.randomUUID(), companyChecklistId, itemId, key, c.get('userId')).run()
  return c.json({ evidenceKey: key }, 201)
})

app.get('/api/evidence/*', requireAuth, async (c) => {
  const key = c.req.path.replace('/api/evidence/', '')
  const membership = await c.env.DB.prepare('SELECT company_id FROM users WHERE id=?').bind(c.get('userId')).first<{ company_id: string | null }>()
  if (!membership?.company_id || !key.startsWith(`${membership.company_id}/`)) return c.json({ error: 'Not found' }, 404)
  const object = await c.env.EVIDENCE.get(key)
  if (!object) return c.json({ error: 'Not found' }, 404)
  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('Content-Disposition', `inline; filename="${object.customMetadata?.originalName ?? 'evidence'}"`)
  return new Response(object.body, { headers })
})

app.get('/api/forms', requireAuth, async (c) => {
  const { results } = await c.env.DB.prepare(`SELECT f.*, r.code regulation_code, r.name regulation_name FROM forms f LEFT JOIN regulations r ON r.id=f.regulation_id WHERE f.active=1 ORDER BY f.name`).all<Record<string, unknown>>()
  return c.json({ forms: results.map((form) => ({ ...form, schema: JSON.parse(form.schema_json as string) })) })
})

app.get('/api/forms/:formId/submission', requireAuth, async (c) => {
  const membership = await c.env.DB.prepare('SELECT company_id FROM users WHERE id=?').bind(c.get('userId')).first<{ company_id: string | null }>()
  if (!membership?.company_id) return c.json({ submission: null })
  const submission = await c.env.DB.prepare('SELECT * FROM form_submissions WHERE company_id=? AND form_id=?').bind(membership.company_id, c.req.param('formId')).first<Record<string, unknown>>()
  return c.json({ submission: submission ? { ...submission, data: JSON.parse(submission.data_json as string) } : null })
})

app.put('/api/forms/:formId/submission', requireAuth, async (c) => {
  const membership = await c.env.DB.prepare('SELECT company_id FROM users WHERE id=?').bind(c.get('userId')).first<{ company_id: string | null }>()
  if (!membership?.company_id) return c.json({ error: 'Company required' }, 409)
  const body = await c.req.json<{ data?: Record<string, string | number>; status?: 'draft' | 'submitted' }>()
  if (!body.data || !['draft', 'submitted'].includes(body.status ?? '')) return c.json({ error: 'Invalid submission' }, 400)
  const id = crypto.randomUUID()
  const submittedAt = body.status === 'submitted' ? new Date().toISOString() : null
  await c.env.DB.prepare(`INSERT INTO form_submissions (id, company_id, form_id, data_json, status, submitted_by, submitted_at)
    VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(company_id, form_id) DO UPDATE SET data_json=excluded.data_json, status=excluded.status, submitted_by=excluded.submitted_by, submitted_at=excluded.submitted_at, updated_at=datetime('now')`)
    .bind(id, membership.company_id, c.req.param('formId'), JSON.stringify(body.data), body.status, c.get('userId'), submittedAt).run()
  const submission = await c.env.DB.prepare('SELECT * FROM form_submissions WHERE company_id=? AND form_id=?').bind(membership.company_id, c.req.param('formId')).first<Record<string, unknown>>()
  return c.json({ submission: { ...submission, data: JSON.parse(submission!.data_json as string) } })
})

app.notFound((c) => c.json({ error: 'Not found' }, 404))
app.onError((error, c) => {
  console.error(error)
  return c.json({ error: 'Internal server error' }, 500)
})

export default app
